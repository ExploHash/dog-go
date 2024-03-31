export type DogConfigVariant = {
  name: string;
  spawnRate: number; // 1 - 100 How often this dog will spawn
  spawnRateVariance: number; // 1 - 100 How much the chance can vary
  imageSrc: string;
  actualSpawnRate?: number;
  parentName?: string;
};

export type DogConfig = {
  name: string;
  variants: DogConfigVariant[];
};

export const doggosConfig: DogConfig[] = [
  {
    name: "Border Collie",
    variants: [
      {
        name: "Black",
        spawnRate: 50,
        spawnRateVariance: 10,
        imageSrc:
          "https://freepngimg.com/thumb/dog/20279-8-border-collie-transparent-background.png",
      },
      {
        name: "White",
        spawnRate: 50,
        spawnRateVariance: 10,
        imageSrc:
          "http://cdn.akc.org/akcdoglovers/BorderCollie_cutout_-_Copy.png",
      },
    ],
  },
  {
    name: "Golden Retriever",
    variants: [
      {
        name: "Golden",
        spawnRate: 50,
        spawnRateVariance: 10,
        imageSrc:
          "http://www.pngall.com/wp-content/uploads/4/Golden-Retriever-PNG-Free-Image.png",
      },
      {
        name: "White",
        spawnRate: 50,
        spawnRateVariance: 10,
        imageSrc:
          "http://clipart.info/images/ccovers/1503688594Golden-Retriever-Puppy-PNG-File.png",
      },
    ],
  },
];
