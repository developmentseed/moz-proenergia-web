import modelConfig from "@/config/model.json";
import { BASE_PATH } from "@/config/website";

export const getIconPath = (modelId: string | number): string => {
  const config = modelConfig.find((c) => String(c.model) === String(modelId));
  return config ? `${BASE_PATH}/model-icon/${config.icon}` : `${BASE_PATH}/model-icon/default.svg`;
};
