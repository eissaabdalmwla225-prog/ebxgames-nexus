import pubgImg from "@/assets/games/pubg.jpg";
import freefireImg from "@/assets/games/freefire.jpg";
import codmImg from "@/assets/games/codm.jpg";
import fortniteImg from "@/assets/games/fortnite.jpg";
import efootballImg from "@/assets/games/efootball.jpg";
import robloxImg from "@/assets/games/roblox.jpg";

export type GamePackage = {
  amount: number;
  currency: string;
  price: number;
};

export type Game = {
  id: string;
  name: string;
  image: string;
  category: "Shooter" | "Sports" | "Sandbox";
  packages: GamePackage[];
};

export const games: Game[] = [
  {
    id: "pubg-mobile",
    name: "PUBG Mobile",
    image: pubgImg,
    category: "Shooter",
    packages: [
      { amount: 60, currency: "UC", price: 0.99 },
      { amount: 325, currency: "UC", price: 4.99 },
      { amount: 660, currency: "UC", price: 9.99 },
      { amount: 1800, currency: "UC", price: 24.99 },
      { amount: 3850, currency: "UC", price: 49.99 },
    ],
  },
  {
    id: "free-fire",
    name: "Free Fire",
    image: freefireImg,
    category: "Shooter",
    packages: [
      { amount: 100, currency: "Diamonds", price: 1 },
      { amount: 310, currency: "Diamonds", price: 3 },
      { amount: 520, currency: "Diamonds", price: 5 },
      { amount: 1060, currency: "Diamonds", price: 10 },
      { amount: 2180, currency: "Diamonds", price: 20 },
    ],
  },
  {
    id: "cod-mobile",
    name: "Call of Duty Mobile",
    image: codmImg,
    category: "Shooter",
    packages: [
      { amount: 80, currency: "CP", price: 1 },
      { amount: 420, currency: "CP", price: 5 },
      { amount: 880, currency: "CP", price: 10 },
      { amount: 2400, currency: "CP", price: 25 },
      { amount: 5000, currency: "CP", price: 50 },
    ],
  },
  {
    id: "fortnite",
    name: "Fortnite",
    image: fortniteImg,
    category: "Shooter",
    packages: [
      { amount: 1000, currency: "V-Bucks", price: 7.99 },
      { amount: 2800, currency: "V-Bucks", price: 19.99 },
      { amount: 5000, currency: "V-Bucks", price: 31.99 },
      { amount: 13500, currency: "V-Bucks", price: 79.99 },
    ],
  },
  {
    id: "efootball-2024",
    name: "eFootball 2024",
    image: efootballImg,
    category: "Sports",
    packages: [
      { amount: 100, currency: "Coins", price: 1 },
      { amount: 550, currency: "Coins", price: 5 },
      { amount: 1200, currency: "Coins", price: 10 },
      { amount: 3000, currency: "Coins", price: 25 },
    ],
  },
  {
    id: "roblox",
    name: "Roblox",
    image: robloxImg,
    category: "Sandbox",
    packages: [
      { amount: 80, currency: "Robux", price: 0.99 },
      { amount: 400, currency: "Robux", price: 4.99 },
      { amount: 800, currency: "Robux", price: 9.99 },
      { amount: 1700, currency: "Robux", price: 19.99 },
      { amount: 4500, currency: "Robux", price: 49.99 },
    ],
  },
];
