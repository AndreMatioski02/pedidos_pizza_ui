import * as React from "react";
import styles from '@/styles/Login.module.css'
import { Box, ButtonLayout, ButtonPrimary, EmailField, IntegerField, PhoneNumberField, Stack, Text2, Text4, Text8, TextField, TextLink, alert } from '@telefonica/mistica'
import { useRouter } from "next/router";
import { api } from "@/services/base";
import { AxiosResponse } from "axios";

export default function ClientRegister() {
  const [name, setName] = React.useState("");
  const [nameValid, setNameValid] = React.useState(true);
  const [CPF, setCPF] = React.useState("");
  const [CPFValid, setCPFValid] = React.useState(true); 
  const [email, setEmail] = React.useState("");
  const [emailValid, setEmailValid] = React.useState(true); 
  const [CEP, setCEP] = React.useState("");
  const [CEPValid, setCEPValid] = React.useState(true); 
  const [endereco, setEndereco] = React.useState("");
  const [enderecoValid, setEnderecoValid] = React.useState(true);
  const [numero, setNumero] = React.useState("");
  const [numeroValid, setNumeroValid] = React.useState(true); 
  const [bairro, setBairro] = React.useState("");
  const [bairroValid, setBairroValid] = React.useState(true); 
  const [cidade, setCidade] = React.useState("");
  const [cidadeValid, setCidadeValid] = React.useState(true); 
  const [UF, setUF] = React.useState("");
  const [UFValid, setUFValid] = React.useState(true); 
  const [telefone, setTelefone] = React.useState("");
  const [telefoneValid, setTelefoneValid] = React.useState(true); 
  const emailRegex = /^[a-z0-9.]+@[a-z0-9]+\.[a-z]+(\.[a-z]+)?$/i
  const router = useRouter();

  const validateEmail = (text: string) => {
    return text.match(emailRegex);
  }

  const handleRegisterUser = async () => {
    if (
      name.length < 2 ||
      CPF.length !== 11 ||
      !validateEmail(email) ||
      CEP.length !== 8 ||
      endereco.length < 5 ||
      Number(numero) <= 0 ||
      bairro.length < 2 ||
      cidade.length < 2 ||
      UF.length !== 2 ||
      telefone.length < 10
    ) {
      setNameValid(false);
      setCPFValid(false);
      setEmailValid(false);
      setCEPValid(false);
      setEnderecoValid(false);
      setNumeroValid(false);
      setBairroValid(false);
      setCidadeValid(false);
      setUFValid(false);
      setTelefoneValid(false);
      return;
    } else {
      try {
        await api.post("/create/client", {
          name,
          CPF,
          email,
          CEP,
          endereco,
          numero,
          bairro,
          cidade,
          UF,
          telefone,
        }).then(res => window.sessionStorage.setItem("clientId", res.data.insertId));
        
        alert({
          message: "Cadastro de cliente efetuado com sucesso!",
          acceptText: "Ok, continuar",
          onAccept() { router.push("/user-register"); }
        });
      } catch (err) {
        console.log(err);
      }
    }
  }

  const handleCEP = () => {
    api.get(`https://viacep.com.br/ws/${CEP}/json/`)
    .then((resp) => {
      setBairro(resp.data.bairro);
      setEndereco(resp.data.logradouro);
      setCidade(resp.data.localidade);
      setUF(resp.data.uf);
    })
  }

  return (
    <Box className={styles.container}>
      <Box className={styles.main}>
        <Box paddingX={16}>
          <Stack space={8}>
            <Text8>Cadastre-se</Text8>
            <Text4 medium>
              Efetue seu cadastro de cliente abaixo.
            </Text4>
          </Stack>
          <Box paddingTop={80}>
            <TextField
              label='Nome'
              name='name-input'
              onChangeValue={setName}
              value={name}
              error={!nameValid}
              helperText="Insira seu nome"
            />
          </Box>
          <Box paddingTop={24}>
            <TextField
              label='CPF'
              name='cpf-input'
              onChangeValue={setCPF}
              value={CPF}
              error={!CPFValid}
              helperText="Insira seu CPF"
              maxLength={11}
            />
          </Box>
          <Box paddingTop={24}>
            <EmailField
              label='E-mail'
              name='email-input'
              onChangeValue={setEmail}
              value={email}
              error={!emailValid}
              helperText="Insira um e-mail válido"
            />
          </Box>
          <Box paddingTop={24}>
            <IntegerField
              label='CEP'
              name='cep-input'
              onChangeValue={setCEP}
              onBlur={handleCEP}
              value={CEP}
              error={!CEPValid}
              helperText="Insira seu CEP"
              maxLength={8}
            />
          </Box>
          <Box paddingTop={24}>
            <TextField
              label='Endereço'
              name='endereco-input'
              onChangeValue={setEndereco}
              value={endereco}
              error={!enderecoValid}
              helperText="Insira seu endereço"
            />
          </Box>
          <Box paddingTop={24}>
            <TextField
              label='Número'
              name='numero-input'
              onChangeValue={setNumero}
              value={numero}
              error={!numeroValid}
              helperText="Insira seu número de endereço"
            />
          </Box>
          <Box paddingTop={24}>
            <TextField
              label='Bairro'
              name='bairro-input'
              onChangeValue={setBairro}
              value={bairro}
              error={!bairroValid}
              helperText="Insira seu bairro"
            />
          </Box>
          <Box paddingTop={24}>
            <TextField
              label='Cidade'
              name='cidade-input'
              onChangeValue={setCidade}
              value={cidade}
              error={!cidadeValid}
              helperText="Insira sua cidade"
            />
          </Box>
          <Box paddingTop={24}>
            <TextField
              label='UF'
              name='UF-input'
              onChangeValue={setUF}
              value={UF}
              error={!UFValid}
              helperText="Insira seu UF"
            />
          </Box>
          <Box paddingTop={24}>
            <PhoneNumberField
              label='Telefone'
              name='telefone-input'
              onChangeValue={setTelefone}
              value={telefone}
              error={!telefoneValid}
              helperText="Insira seu telefone"
              maxLength={11}
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
