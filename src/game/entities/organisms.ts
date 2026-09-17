export interface OrganismData {
   id: string;
   name: string;
   texture: string;
   default_scale: number;

}

export const organisms: OrganismData[] = [
   {
      id: "acacia",
      name: "Acacia",
      texture: "acacia_sprite",
      default_scale: 1.5
   },
{
   id: "shroom",
   name: "shroom",
   texture: "shroom",
   default_scale: 1
}

];
