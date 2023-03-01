import { Token } from "./Token";

export interface Assets {
  [address: string]: {
    [id: string]: Token
  }
}