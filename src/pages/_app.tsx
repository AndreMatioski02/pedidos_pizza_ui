import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeContextProvider, getVivoNewSkin } from '@telefonica/mistica'
import "@telefonica/mistica/css/mistica.css";

const misticaTheme: any = {
  colorScheme: 'light',
  skin: getVivoNewSkin(),
  i18n: {locale: 'es-ES', phoneNumberFormattingRegionCode: 'ES'},
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeContextProvider theme={misticaTheme}>
      <Component {...pageProps} />
    </ThemeContextProvider>
  ) 
}
