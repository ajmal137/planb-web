import { AvatarProps, Avatar as MAvatar } from "@mantine/core";
import type { PolymorphicComponentProps } from "@mantine/utils";

const colors = [
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#03a9f4",
  "#00bcd4",
  "#009688",
  "#4caf50",
  "#8bc34a",
  "#cddc39",
];

function getRandomColor(letter?: string) {
  if (!letter) return "#fff";
  const index = letter.charCodeAt(0) % colors.length;
  return colors[index];
}

type Props = PolymorphicComponentProps<"div", AvatarProps> & {
  text?: string;
};

export default function Avatar({ text, size = 45, ...rest }: Props) {
  return (
    <MAvatar
      {...rest}
      radius="xl"
      size="sm"
      styles={{
        placeholder: {
          backgroundColor: getRandomColor(text),
          color: "white",
        },
      }}
    >
      {text?.charAt(0).toUpperCase()}
    </MAvatar>
  );
}
