import * as React from "react";
import styles from '@/styles/Login.module.css'
import { Box, ButtonLayout, ButtonPrimary, ButtonSecondary, EmailField, IconUserAccountRegular, Inline, IntegerField, PasswordField, PhoneNumberField, ResponsiveLayout, Stack, Text2, Text4, Text8, TextField, TextLink, alert } from '@telefonica/mistica'
import { useRouter } from "next/router";
import { api } from "@/services/base";

export default function EditProfile() {
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
  const [username, setUsername] = React.useState("");
  const [usernameValid, setUsernameValid] = React.useState(true);  
  const [password, setPassword] = React.useState("");
  const [passwordValid, setPasswordValid] = React.useState(true); 
  const [userId, setUserId] = React.useState("");
  const [clientId, setClientId] = React.useState("");
  const emailRegex = /^[a-z0-9.]+@[a-z0-9]+\.[a-z]+(\.[a-z]+)?$/i
  const router = useRouter();

  const lastAccessAt = new Date().toJSON().split('.')[0].replace('T', ' ');

  const validateEmail = (text: string) => {
    return text.match(emailRegex);
  }

  React.useEffect(() => {
    setUserId(window.sessionStorage.getItem("userId") as string);
    setClientId(window.sessionStorage.getItem("clientId") as string);
  }, []);

  React.useEffect(() => {
    if(userId){
      handleGetUserInfo();
    }
    if(clientId) {
      handleGetClientInfo();
    }
  }, [userId, clientId]);

  const handleGetUserInfo = async () => {
    await api.get(`/get/user/${userId}`).then(res => {
      setUsername(res.data[0].username);
      setPassword(res.data[0].password);
    });
  }

  const handleGetClientInfo = async () => {
    await api.get(`/get/client/${clientId}`).then(res => {
      setName(res.data[0].name);
      setCPF(res.data[0].cpf);
      setEmail(res.data[0].email);
      setCEP(res.data[0].address_cep);
      setEndereco(res.data[0].address);
      setNumero(res.data[0].address_number);
      setBairro(res.data[0].district);
      setCidade(res.data[0].city);
      setUF(res.data[0].uf);
      setTelefone(res.data[0].phone_number);
    });
  }

  const handleEditClient = async () => {
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
      telefone.length < 10 ||
      username.length < 2 ||
      password.length < 6
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
      setUsernameValid(false);
      setPasswordValid(false);
      return;
    } else {
      try{
        await api.put(`/update/client/${clientId}`, {
          name: name,
          cpf: CPF,
          email: email,
          address_cep: CEP,
          address: endereco,
          address_number: Number(numero),
          district: bairro,
          city: cidade,
          uf: UF,
          phone_number: telefone,
        });
      } catch(err) {
        console.log(err);
      }
    }
  }

  const handleEditUser = async () => {
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
      telefone.length < 10 ||
      username.length < 2 ||
      password.length < 6
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
      setUsernameValid(false);
      setPasswordValid(false);
      return;
    } else {
      try{
        await api.put(`/update/user/${userId}`, {
          client_id: clientId,
          username,
          password,
          last_access_at: lastAccessAt
        })
        alert({
          message: "Perfil atualizado com sucesso!",
          acceptText: "Ok, continuar",
          onAccept() { router.replace("/home"); }
        });
      } catch(err) {
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
    <ResponsiveLayout className={styles.main}>
      <Box paddingX={16}>
        <Stack space={8}>
          <Inline space={16} alignItems="center">
            <IconUserAccountRegular size={40} />
            <Text8>Atualize seus dados</Text8>
          </Inline>
          <Box paddingTop={40}>
            <Text4 medium>
              Atualize seu perfil de cliente abaixo
            </Text4>
          </Box>
        </Stack>
        <Box paddingTop={40}>
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
          <Box paddingTop={40}>
            <Text4 medium>
              Atualize seu perfil de usuário abaixo
            </Text4>
            <Box paddingTop={40}>
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
                onChangeValue={setPassword}
                value={password}
                error={!passwordValid}
                helperText="Insira sua Senha"
              />
            </Box>
          </Box>
        <Box paddingTop={56}>
          <ButtonLayout>
            <ButtonSecondary onPress={router.back}>
              Cancelar
            </ButtonSecondary>
            <ButtonPrimary onPress={() => { handleEditUser(); handleEditClient() }}>
              Atualizar
            </ButtonPrimary>
          </ButtonLayout>
        </Box>
      </Box>
    </ResponsiveLayout>
  )
}
