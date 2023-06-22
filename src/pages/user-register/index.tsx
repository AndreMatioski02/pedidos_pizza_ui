import * as React from "react";
import styles from '@/styles/Login.module.css'
import { Box, ButtonLayout, ButtonPrimary, EmailField, IntegerField, PasswordField, PhoneNumberField, Stack, Text2, Text4, Text8, TextField, TextLink, alert } from '@telefonica/mistica'
import { useRouter } from "next/router";
import { api } from "@/services/base";
import { AxiosResponse } from "axios";

export default function ClientRegister() {
  const [username, setUsername] = React.useState("");
  const [usernameValid, setUsernameValid] = React.useState(true);
  const [senha, setSenha] = React.useState("");
  const [senhaValid, setSenhaValid] = React.useState(true); 
  const router = useRouter();

  const lastAccessAt = new Date().toJSON().split('.')[0].replace('T', ' ');

  const handleRegisterUser = async () => {
    if (
      username.length < 6 ||
      senha.length < 6 
    ) {
      setUsernameValid(false);
      setSenhaValid(false);
      return;
    } else {
      try {
        await api.post("/create/user", {
          username,
          senha,
          lastAccessAt,
        });
        alert({
          message: "Cadastro de usuãrio efetuado com sucesso!",
          acceptText: "Ok, continuar",
          onAccept() { router.push("/"); }
        });
      } catch (err) {
        console.log(err);
      }
    }
  }

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
              name='senha-input'
              onChangeValue={setSenha}
              value={senha}
              error={!senhaValid}
              helperText="Insira sua Senha"
            />
          </Box>
          <Box paddingTop={56}>
            <ButtonLayout>
              <ButtonPrimary onPress={() => { handleRegisterUser() }}>
                Cadastrar
              </ButtonPrimary>
            </ButtonLayout>
          </Box>
          <Box paddingTop={32}>
            <Text2 medium>
              Já possui uma conta? <TextLink onPress={() => { router.push("/") }}>Faça login</TextLink> agora!
            </Text2>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
