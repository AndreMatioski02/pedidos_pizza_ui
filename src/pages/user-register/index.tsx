import * as React from "react";
import styles from '@/styles/Login.module.css'
import { Box, ButtonLayout, ButtonPrimary, EmailField, IntegerField, PasswordField, PhoneNumberField, Stack, Text2, Text4, Text8, TextField, TextLink, alert } from '@telefonica/mistica'
import { useRouter } from "next/router";
import { api } from "@/services/base";
import { AxiosResponse } from "axios";

export default function ClientRegister() {
  const [username, setUsername] = React.useState("");
  const [usernameValid, setUsernameValid] = React.useState(true);
  const [password, setPassword] = React.useState("");
  const [passwordValid, setPasswordValid] = React.useState(true); 
  const [clientId, setClientId] = React.useState(""); 
  const router = useRouter();

  const lastAccessAt = new Date().toJSON().split('.')[0].replace('T', ' ');

  const handleRegisterUser = async () => {
    if (
      username.length < 6 ||
      password.length < 6 
    ) {
      setUsernameValid(false);
      setPasswordValid(false);
      return;
    } else {
      try {
        await api.post("/create/user", {
          client_id: clientId,
          username,
          password,
          last_access_at: lastAccessAt,
        });
        alert({
          message: "Cadastro de usuário efetuado com sucesso!",
          acceptText: "Ok, continuar",
          onAccept() { router.push("/"); }
        });
      } catch (err) {
        console.log(err);
      }
    }
  }

  React.useEffect(() => {
    setClientId(window.sessionStorage.getItem("clientId") as string);
    console.log(clientId);
  }, [])

  return (
    <Box className={styles.container}>
      <Box className={styles.main}>
        <Box paddingX={16}>
          <Stack space={8}>
            <Text8>Cadastre-se</Text8>
            <Text4 medium>
              Efetue seu cadastro de usuário abaixo.
            </Text4>
          </Stack>
          <Box paddingTop={80}>
            <TextField
              label='Username'
              name='username-input'
              onChangeValue={setUsername}
              value={username}
              error={!usernameValid}
              helperText="Insira seu nome"
            />
          </Box>
          <Box paddingTop={24}>
            <PasswordField
              label='Senha'
              name='passoword-input'
              onChangeValue={setPassword}
              value={password}
              error={!passwordValid}
              helperText="Insira sua senha"
            />
          </Box>
          <Box paddingTop={56}>
            <ButtonLayout>
              <ButtonPrimary onPress={() => { handleRegisterUser() }}>
                Cadastrar
              </ButtonPrimary>
            </ButtonLayout>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
