import { Fragment, useEffect } from "react";
import "./App.css";
import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  List,
  Modal,
  NumberInput,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { IconCircleCheck, IconAlertCircle } from "@tabler/icons";
import { firebaseConfig } from "./config";
import { useDisclosure, useInputState } from "@mantine/hooks";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
  const [addPlayerOpened, addPlayerHandlers] = useDisclosure(false);
  const [editSettingsOpened, editSettingsHandlers] = useDisclosure(false);

  const options = {
    snapshotListenOptions: { includeMetadataChanges: true },
  };

  const [teamCollection, teamLoading, teamError] = useCollection(
    collection(db, "team"),
    options
  );

  const [settingsCollection, settingsLoading, settingsError] = useCollection(
    collection(db, "settings"),
    options
  );

  const [playersCollection, playersLoading, playersError] = useCollection(
    collection(db, "player"),
    options
  );

  if (
    teamError ||
    settingsError ||
    playersError ||
    teamLoading ||
    settingsLoading ||
    playersLoading ||
    !teamCollection ||
    !settingsCollection ||
    !playersCollection
  )
    return null;

  const settings = {
    id: settingsCollection.docs[0].id,
    ...settingsCollection.docs[0].data(),
  };
  if (!settings) return null;

  const players = playersCollection.docs.map((p) => ({
    id: p.id,
    ...p.data(),
  }));

  return (
    <div>
      <Modal
        opened={addPlayerOpened}
        onClose={addPlayerHandlers.close}
        size="lg"
        title="Add Player"
      >
        <AddPlayer onCancel={addPlayerHandlers.close} />
      </Modal>
      <Modal
        opened={editSettingsOpened}
        onClose={editSettingsHandlers.close}
        size="lg"
        title="Edit Settings"
      >
        <EditSettings
          onCancel={editSettingsHandlers.close}
          settings={settings}
        />
      </Modal>
      <ScrollArea style={{ height: "100vh", width: "100vw" }} p="sm">
        <Group>
          <Button mb="sm" onClick={addPlayerHandlers.open}>
            Add Player
          </Button>
          <Button mb="sm" onClick={editSettingsHandlers.open}>
            Edit Settings
          </Button>
        </Group>
        <SimpleGrid
          cols={3}
          breakpoints={[
            { maxWidth: 980, cols: 3, spacing: "md" },
            { maxWidth: 755, cols: 2, spacing: "sm" },
            { maxWidth: 600, cols: 1, spacing: "sm" },
          ]}
        >
          {teamCollection.docs.map((doc) => {
            const team = doc.data();
            let spend = 0;
            let selectedPlayerCount = 0;

            if (team.userplayer) {
              spend = team.userplayer.reduce(
                (sum, player) => sum + player.price,
                0
              );
              selectedPlayerCount = team.userplayer.length;
            }

            return (
              <Card shadow="md" p="xl" radius="md" withBorder key={doc.id}>
                <Card.Section
                  component={Title}
                  order={4}
                  align="center"
                  py="sm"
                  variant="gradient"
                >
                  {team.name}
                </Card.Section>
                <Group position="apart">
                  <Badge
                    color="red"
                    variant="filled"
                    style={{ minWidth: "8rem" }}
                  >
                    Spend : {spend}
                  </Badge>
                  <Badge
                    color="green"
                    variant="filled"
                    style={{ minWidth: "8rem" }}
                  >
                    Balance : {settings.total - spend}
                  </Badge>
                </Group>

                {team.userplayer && (
                  <Stack spacing="xs" mt="md">
                    {team.userplayer.map((playerData, index) => {
                      const player = players.find(
                        (p) => p.id === playerData.id
                      );
                      const isBidError = playerData.price < player.price;

                      return (
                        <Group key={playerData.id}>
                          <ThemeIcon color="pink" size={28} radius="xl">
                            {index + 1}
                          </ThemeIcon>
                          <Text size="sm">{player.name}</Text>
                          <Badge
                            color={isBidError ? "red" : "green"}
                            variant="filled"
                            style={{ minWidth: "3rem", marginLeft: "auto" }}
                          >
                            {playerData.price}
                          </Badge>
                          {isBidError ? (
                            <ThemeIcon color="red" size={28} radius="xl">
                              <IconAlertCircle size={20} />
                            </ThemeIcon>
                          ) : (
                            <ThemeIcon color="green" size={28} radius="xl">
                              <IconCircleCheck size={20} />
                            </ThemeIcon>
                          )}
                        </Group>
                      );
                    })}
                    {Array(settings.playercount - selectedPlayerCount)
                      .fill(0)
                      .map((_, index) => (
                        <Group key={index}>
                          <ThemeIcon color="pink" size={28} radius="xl">
                            {index + selectedPlayerCount + 1}
                          </ThemeIcon>
                          <Text size="sm">-</Text>
                        </Group>
                      ))}
                  </Stack>
                )}
              </Card>
            );
          })}
        </SimpleGrid>
      </ScrollArea>
    </div>
  );
}

function AddPlayer({ onCancel }) {
  const [name, setName] = useInputState("");
  const [price, setPrice] = useInputState(10);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await addDoc(collection(db, "player"), {
            name,
            price,
          });
        } catch (error) {
          console.log(error);
        }
      }}
    >
      <Stack spacing="sm">
        <TextInput
          data-autofocus
          value={name}
          onChange={setName}
          label="Name"
        />
        <NumberInput value={price} onChange={setPrice} label="Price" />
      </Stack>
      <Group position="right" pt="md">
        <Button onClick={onCancel} color="red" type="button">
          Cancel
        </Button>
        <Button type="submit"> Submit</Button>
      </Group>
    </form>
  );
}

function EditSettings({ onCancel, settings }) {
  const [playermax, setPlayermax] = useInputState(settings.playermax);
  const [playercount, setPlayercount] = useInputState(settings.playercount);
  const [total, setTotal] = useInputState(settings.total);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        console.log(
          {
            playermax,
            playercount,
            total,
          },
          settings.id
        );
        try {
          await setDoc(doc(db, "settings", settings.id), {
            playermax,
            playercount,
            total,
          });
        } catch (error) {
          console.log(error);
        }
      }}
    >
      <Stack spacing="sm">
        <NumberInput
          data-autofocus
          value={playermax}
          onChange={setPlayermax}
          label="Player Minimum"
        />
        <NumberInput
          value={playercount}
          onChange={setPlayercount}
          label="Player Count"
        />
        <NumberInput value={total} onChange={setTotal} label="Total" />
      </Stack>
      <Group position="right" pt="md">
        <Button onClick={onCancel} color="red" type="button">
          Cancel
        </Button>
        <Button type="submit"> Submit</Button>
      </Group>
    </form>
  );
}

export default App;
