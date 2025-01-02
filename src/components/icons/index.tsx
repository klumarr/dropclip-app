import { SvgIcon, SvgIconProps } from "@mui/material";
import { Person, MusicNote } from "@mui/icons-material";

export const FanIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <Person />
  </SvgIcon>
);

export const CreativeIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <MusicNote />
  </SvgIcon>
);
