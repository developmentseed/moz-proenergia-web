import modelConfig from "@/config/model.json";

export const getIconPath = (modelId: string | number): string => {
  const config = modelConfig.find((c) => String(c.model) === String(modelId));
  return config ? `/model-icon/${config.icon}` : `/model-icon/default.svg`;
};
