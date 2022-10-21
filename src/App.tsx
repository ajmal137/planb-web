import { Fragment, useEffect, useState } from "react";
import "./App.css";
import {
  ActionIcon,
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
  Table,
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
import { Select } from '@mantine/core';
import { MdEdit } from "react-icons/md";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


function App() {

  const [addPlayerOpened, addPlayerHandlers] = useDisclosure(false);
  const [addteamOpened, addteamHandlers] = useDisclosure(false);
  const [editSettingsOpened, editSettingsHandlers] = useDisclosure(false);

  const [selectedPlayer, setSelectedPlayer]:any = useState(null)

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
    return null

  const settings: any = {
    id: settingsCollection.docs[0].id,
    ...settingsCollection.docs[0].data(),
  };
  if (!settings) return null;

  const team = {
    id: teamCollection.docs[0].id,
    ...teamCollection.docs[0].data(),
  };
  if (!settings) return null;



  const players: any = playersCollection.docs.map((p) => ({
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
        <AddPlayer onCancel={addPlayerHandlers.close} selectedPlayer={selectedPlayer} />
      </Modal>
      <Modal
        opened={addteamOpened}
        onClose={addteamHandlers.close}
        size="lg"
        title="Add Team"
      >
        <AddTeam onCancel={addPlayerHandlers.close} />
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
          <Button mb="sm" onClick={() => {
            setSelectedPlayer(null)
            addPlayerHandlers.open()
          }}>
            Add Player
          </Button>
          <Button mb="sm" onClick={editSettingsHandlers.open}>
            Edit Settings
          </Button>
          <Button mb="sm" onClick={addteamHandlers.open}>
            Add Team
          </Button>
        </Group>
        <SimpleGrid
          cols={3}
          breakpoints={[
            { maxWidth: 1400, cols: 3, spacing: "md" },
            { maxWidth: 1200, cols: 2, spacing: "md" },
            { maxWidth: 700, cols: 1, spacing: "sm" },
          ]}
        >
          {teamCollection.docs.map((doc) => {
            const team = doc.data();
            let spend = 0;
            let selectedPlayerCount = 0;

            if (team.userplayer) {
              spend = team.userplayer.reduce(
                (sum: any, player: any) => sum + player.price,
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
                <Card.Section
                  component={Title}
                  order={5}
                  align="center"
                  py="sm"
                  variant="gradient"
                >
                  Manager : {team.manager}
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
                    {team.userplayer.map((playerData: any, index: any) => {
                      const player = players.find(
                        (p: any) => p.id === playerData.id
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
        <br />
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {
              players.map((player: any) => <tr >
                <td>{player.name}</td>
                <td>{player.position}</td>
                <td>{player.price}</td>
                <td>
                  <ActionIcon color="red" variant="outline" onClick={() => { setSelectedPlayer(player); addPlayerHandlers.open() }}>
                    <MdEdit />
                  </ActionIcon></td>
              </tr>)
            }
          </tbody>
        </Table>
        {/* <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Team</th>
              <th>Manager</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {team.map(team =>
              < tr >
                <td></td>
              </tr>)
            }
          </tbody>
        </Table> */}
      </ScrollArea>
    </div >
  );
}
function AddPlayer({ onCancel, selectedPlayer }) {
  console.log(selectedPlayer)
  const [name, setName] = useInputState("");
  const [price, setPrice] = useInputState(4);
  const [position, setPosition] = useInputState("");

  useEffect(() => {
    if (selectedPlayer) {
      setName(selectedPlayer.name);
      setPrice(selectedPlayer.price)
      setPosition(selectedPlayer.position)
    }
  }, [selectedPlayer])

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          if (selectedPlayer) {
            await setDoc(doc(db, "player", selectedPlayer.id), {
              name,
              position,
              price,
            });
          } else {
            await addDoc(collection(db, "player"), {
              name,
              position,
              price,
            });
          }

          onCancel()
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
        <Select onChange={setPosition}
          label="Position"
          placeholder="Pick one"
          data={[
            { value: 'GK', label: '(GK)GoalKeeper' },
            { value: 'DF', label: '(DF)Defender' },
            { value: 'FW', label: '(FW)Forward' },
          ]}
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

function AddTeam({ onCancel }) {
  const [name, setName] = useInputState("");
  const [email, setEmail] = useInputState("");
  const [manager, setManager] = useInputState("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await addDoc(collection(db, "team"), {
            manager,
            name,
            email,
            userplayer: []
          });
          onCancel()
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
          label="Team Name"
        />
        <TextInput value={email} onChange={setEmail} label="Email" />
        <TextInput value={manager} onChange={setManager} label="Manager" />
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
          onCancel()
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

