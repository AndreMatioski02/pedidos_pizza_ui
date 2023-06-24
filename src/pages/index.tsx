import * as React from "react";
import styles from '@/styles/Login.module.css'
import { Box, ButtonLayout, ButtonPrimary, EmailField, PasswordField, ResponsiveLayout, Stack, Text2, Text4, Text8, TextLink, alert } from '@telefonica/mistica'
import { useRouter } from "next/router";
import { api } from "@/services/base";

export default function Login() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const router = useRouter();

  const handleUserLogin = async () => {
    try {
      await api.post("/login", {
        email,
        password
      }).then(res => {
        window.sessionStorage.setItem("userId", res.data[0].id);
        window.sessionStorage.setItem("clientId", res.data[0].client_id);

      });
      router.push("/home");
    } catch (err) {
      console.log(err);
      alert({
        title: "Usuário ou senha inválidos!",
        message: "Por favor, tente novamente",
        acceptText: "Fechar"
      });
    }
  }

  return (
    <Box className={styles.container}>
      <Box className={styles.main}>
        <Box paddingX={16}>
          <Stack space={8}>
            <Text8>Olá, seja bem vindo!</Text8>
            <Text4 medium>
              Efetue seu login abaixo
            </Text4>
          </Stack>
          <Box paddingTop={80}>
            <EmailField
              label='E-mail'
              name='email-input'
              value={email}
              onChangeValue={setEmail}
            />
          </Box>
          <Box paddingTop={24}>
            <PasswordField
              label='Senha'
              name='password-input'
              value={password}
              onChangeValue={setPassword}
            />
          </Box>
          <Box paddingTop={56}>
            <ButtonLayout>
              <ButtonPrimary onPress={() => {
                handleUserLogin();
              }}>
                Login
              </ButtonPrimary>
            </ButtonLayout>
          </Box>
          <Box paddingTop={32}>
            <Text2 medium>
              Não possui uma conta? <TextLink onPress={() => { router.push("/client-register") }}>Cadastre-se</TextLink> agora!
            </Text2>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
