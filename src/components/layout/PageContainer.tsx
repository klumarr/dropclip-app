import { Container, ContainerProps } from "@mui/material";

export const PageContainer = ({ children, ...props }: ContainerProps) => {
  return (
    <Container
      {...props}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        py: { xs: 2, sm: 4 },
        ...props.sx,
      }}
    >
      {children}
    </Container>
  );
};
