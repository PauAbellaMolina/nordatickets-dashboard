import { Dict } from "i18n-js";
import { en } from "./en";
import { ca } from "./ca";
import { es } from "./es";

export enum AvailableLocales {
  EN = 'en',
  CA = 'ca',
  ES = 'es'
}

export const dict: Dict = {
  en: en,
  ca: ca,
  es: es
};