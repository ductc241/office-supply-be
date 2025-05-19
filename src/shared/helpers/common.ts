import { REGEX } from "../constants/common";

export const replaceQuerySearch = (search: string) => {
  return search.replace(REGEX.ESCAPE_SPECIAL_CHARS, "\\$&");
};
