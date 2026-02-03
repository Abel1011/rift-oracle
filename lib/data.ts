import { Champion } from './types';

export const CHAMPIONS: Champion[] = [
  // ===== TOP LANERS =====
  {
    id: 'Aatrox',
    name: 'Aatrox',
    roles: ['TOP'],
    winRate: 0.50,
    pickRate: 0.12,
    banRate: 0.15,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Aatrox.png'
  },
  {
    id: 'Ambessa',
    name: 'Ambessa',
    roles: ['TOP', 'JUNGLE'],
    winRate: 0.48,
    pickRate: 0.15,
    banRate: 0.35,
    tags: ['Fighter', 'Assassin'],
    imageUrl: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data/1b20e5e8cea542296a62b09dd4a67e81570ce80c-496x560.png?accountingTag=LoL&auto=format&fit=fill&q=80&w=496'
  },
  {
    id: 'Camille',
    name: 'Camille',
    roles: ['TOP'],
    winRate: 0.51,
    pickRate: 0.08,
    banRate: 0.06,
    tags: ['Fighter', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Camille.png'
  },
  {
    id: 'Darius',
    name: 'Darius',
    roles: ['TOP'],
    winRate: 0.51,
    pickRate: 0.10,
    banRate: 0.12,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Darius.png'
  },
  {
    id: 'Fiora',
    name: 'Fiora',
    roles: ['TOP'],
    winRate: 0.50,
    pickRate: 0.07,
    banRate: 0.08,
    tags: ['Fighter', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Fiora.png'
  },
  {
    id: 'Gangplank',
    name: 'Gangplank',
    roles: ['TOP', 'MID'],
    winRate: 0.49,
    pickRate: 0.05,
    banRate: 0.04,
    tags: ['Fighter', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Gangplank.png'
  },
  {
    id: 'Garen',
    name: 'Garen',
    roles: ['TOP'],
    winRate: 0.52,
    pickRate: 0.08,
    banRate: 0.03,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Garen.png'
  },
  {
    id: 'Gnar',
    name: 'Gnar',
    roles: ['TOP'],
    winRate: 0.49,
    pickRate: 0.06,
    banRate: 0.02,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Gnar.png'
  },
  {
    id: 'Gwen',
    name: 'Gwen',
    roles: ['TOP'],
    winRate: 0.48,
    pickRate: 0.07,
    banRate: 0.10,
    tags: ['Fighter', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Gwen.png'
  },
  {
    id: 'Illaoi',
    name: 'Illaoi',
    roles: ['TOP'],
    winRate: 0.51,
    pickRate: 0.04,
    banRate: 0.05,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Illaoi.png'
  },
  {
    id: 'Irelia',
    name: 'Irelia',
    roles: ['TOP', 'MID'],
    winRate: 0.48,
    pickRate: 0.09,
    banRate: 0.08,
    tags: ['Fighter', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Irelia.png'
  },
  {
    id: 'Jax',
    name: 'Jax',
    roles: ['TOP', 'JUNGLE'],
    winRate: 0.52,
    pickRate: 0.10,
    banRate: 0.15,
    tags: ['Fighter', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Jax.png'
  },
  {
    id: 'Jayce',
    name: 'Jayce',
    roles: ['TOP', 'MID'],
    winRate: 0.48,
    pickRate: 0.06,
    banRate: 0.03,
    tags: ['Fighter', 'Marksman'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Jayce.png'
  },
  {
    id: 'Kennen',
    name: 'Kennen',
    roles: ['TOP'],
    winRate: 0.50,
    pickRate: 0.04,
    banRate: 0.02,
    tags: ['Mage', 'Marksman'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Kennen.png'
  },
  {
    id: 'KSante',
    name: "K'Sante",
    roles: ['TOP'],
    winRate: 0.47,
    pickRate: 0.08,
    banRate: 0.20,
    tags: ['Tank', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/KSante.png'
  },
  {
    id: 'Malphite',
    name: 'Malphite',
    roles: ['TOP'],
    winRate: 0.52,
    pickRate: 0.08,
    banRate: 0.05,
    tags: ['Tank', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Malphite.png'
  },
  {
    id: 'Mordekaiser',
    name: 'Mordekaiser',
    roles: ['TOP'],
    winRate: 0.51,
    pickRate: 0.07,
    banRate: 0.08,
    tags: ['Fighter', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Mordekaiser.png'
  },
  {
    id: 'Nasus',
    name: 'Nasus',
    roles: ['TOP'],
    winRate: 0.51,
    pickRate: 0.06,
    banRate: 0.04,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Nasus.png'
  },
  {
    id: 'Ornn',
    name: 'Ornn',
    roles: ['TOP'],
    winRate: 0.50,
    pickRate: 0.05,
    banRate: 0.03,
    tags: ['Tank', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Ornn.png'
  },
  {
    id: 'Renekton',
    name: 'Renekton',
    roles: ['TOP'],
    winRate: 0.48,
    pickRate: 0.06,
    banRate: 0.03,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Renekton.png'
  },
  {
    id: 'Riven',
    name: 'Riven',
    roles: ['TOP'],
    winRate: 0.50,
    pickRate: 0.07,
    banRate: 0.05,
    tags: ['Fighter', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Riven.png'
  },
  {
    id: 'Rumble',
    name: 'Rumble',
    roles: ['TOP', 'MID'],
    winRate: 0.51,
    pickRate: 0.04,
    banRate: 0.02,
    tags: ['Fighter', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Rumble.png'
  },
  {
    id: 'Sett',
    name: 'Sett',
    roles: ['TOP', 'SUPPORT'],
    winRate: 0.51,
    pickRate: 0.08,
    banRate: 0.05,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Sett.png'
  },
  {
    id: 'Shen',
    name: 'Shen',
    roles: ['TOP'],
    winRate: 0.51,
    pickRate: 0.05,
    banRate: 0.03,
    tags: ['Tank', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Shen.png'
  },
  {
    id: 'Teemo',
    name: 'Teemo',
    roles: ['TOP'],
    winRate: 0.52,
    pickRate: 0.06,
    banRate: 0.08,
    tags: ['Marksman', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Teemo.png'
  },
  {
    id: 'Tryndamere',
    name: 'Tryndamere',
    roles: ['TOP'],
    winRate: 0.51,
    pickRate: 0.05,
    banRate: 0.04,
    tags: ['Fighter', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Tryndamere.png'
  },
  {
    id: 'Urgot',
    name: 'Urgot',
    roles: ['TOP'],
    winRate: 0.51,
    pickRate: 0.04,
    banRate: 0.02,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Urgot.png'
  },
  {
    id: 'Volibear',
    name: 'Volibear',
    roles: ['TOP', 'JUNGLE'],
    winRate: 0.50,
    pickRate: 0.06,
    banRate: 0.04,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Volibear.png'
  },
  {
    id: 'Yone',
    name: 'Yone',
    roles: ['TOP', 'MID'],
    winRate: 0.49,
    pickRate: 0.15,
    banRate: 0.25,
    tags: ['Assassin', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Yone.png'
  },
  
  // ===== JUNGLERS =====
  {
    id: 'Elise',
    name: 'Elise',
    roles: ['JUNGLE'],
    winRate: 0.50,
    pickRate: 0.06,
    banRate: 0.03,
    tags: ['Mage', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Elise.png'
  },
  {
    id: 'Evelynn',
    name: 'Evelynn',
    roles: ['JUNGLE'],
    winRate: 0.50,
    pickRate: 0.05,
    banRate: 0.06,
    tags: ['Assassin', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Evelynn.png'
  },
  {
    id: 'Graves',
    name: 'Graves',
    roles: ['JUNGLE'],
    winRate: 0.49,
    pickRate: 0.08,
    banRate: 0.05,
    tags: ['Marksman', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Graves.png'
  },
  {
    id: 'Hecarim',
    name: 'Hecarim',
    roles: ['JUNGLE'],
    winRate: 0.51,
    pickRate: 0.07,
    banRate: 0.05,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Hecarim.png'
  },
  {
    id: 'JarvanIV',
    name: 'Jarvan IV',
    roles: ['JUNGLE'],
    winRate: 0.51,
    pickRate: 0.10,
    banRate: 0.05,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/JarvanIV.png'
  },
  {
    id: 'Kayn',
    name: 'Kayn',
    roles: ['JUNGLE'],
    winRate: 0.50,
    pickRate: 0.12,
    banRate: 0.08,
    tags: ['Fighter', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Kayn.png'
  },
  {
    id: 'Khazix',
    name: "Kha'Zix",
    roles: ['JUNGLE'],
    winRate: 0.51,
    pickRate: 0.10,
    banRate: 0.07,
    tags: ['Assassin', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Khazix.png'
  },
  {
    id: 'Kindred',
    name: 'Kindred',
    roles: ['JUNGLE'],
    winRate: 0.50,
    pickRate: 0.06,
    banRate: 0.03,
    tags: ['Marksman', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Kindred.png'
  },
  {
    id: 'LeeSin',
    name: 'Lee Sin',
    roles: ['JUNGLE'],
    winRate: 0.49,
    pickRate: 0.18,
    banRate: 0.07,
    tags: ['Fighter', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/LeeSin.png'
  },
  {
    id: 'Lillia',
    name: 'Lillia',
    roles: ['JUNGLE'],
    winRate: 0.51,
    pickRate: 0.06,
    banRate: 0.04,
    tags: ['Fighter', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Lillia.png'
  },
  {
    id: 'MasterYi',
    name: 'Master Yi',
    roles: ['JUNGLE'],
    winRate: 0.51,
    pickRate: 0.08,
    banRate: 0.10,
    tags: ['Assassin', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/MasterYi.png'
  },
  {
    id: 'Nidalee',
    name: 'Nidalee',
    roles: ['JUNGLE'],
    winRate: 0.48,
    pickRate: 0.05,
    banRate: 0.02,
    tags: ['Assassin', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Nidalee.png'
  },
  {
    id: 'Nocturne',
    name: 'Nocturne',
    roles: ['JUNGLE'],
    winRate: 0.51,
    pickRate: 0.06,
    banRate: 0.04,
    tags: ['Assassin', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Nocturne.png'
  },
  {
    id: 'Nunu',
    name: 'Nunu & Willump',
    roles: ['JUNGLE'],
    winRate: 0.52,
    pickRate: 0.05,
    banRate: 0.02,
    tags: ['Tank', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Nunu.png'
  },
  {
    id: 'RekSai',
    name: "Rek'Sai",
    roles: ['JUNGLE'],
    winRate: 0.50,
    pickRate: 0.04,
    banRate: 0.02,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/RekSai.png'
  },
  {
    id: 'Rell',
    name: 'Rell',
    roles: ['SUPPORT', 'JUNGLE'],
    winRate: 0.51,
    pickRate: 0.06,
    banRate: 0.04,
    tags: ['Tank', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Rell.png'
  },
  {
    id: 'Rengar',
    name: 'Rengar',
    roles: ['JUNGLE', 'TOP'],
    winRate: 0.50,
    pickRate: 0.06,
    banRate: 0.05,
    tags: ['Assassin', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Rengar.png'
  },
  {
    id: 'Sejuani',
    name: 'Sejuani',
    roles: ['JUNGLE'],
    winRate: 0.50,
    pickRate: 0.08,
    banRate: 0.03,
    tags: ['Tank', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Sejuani.png'
  },
  {
    id: 'Shaco',
    name: 'Shaco',
    roles: ['JUNGLE'],
    winRate: 0.51,
    pickRate: 0.05,
    banRate: 0.08,
    tags: ['Assassin', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Shaco.png'
  },
  {
    id: 'Udyr',
    name: 'Udyr',
    roles: ['JUNGLE'],
    winRate: 0.50,
    pickRate: 0.05,
    banRate: 0.03,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Udyr.png'
  },
  {
    id: 'Vi',
    name: 'Vi',
    roles: ['JUNGLE'],
    winRate: 0.51,
    pickRate: 0.07,
    banRate: 0.04,
    tags: ['Fighter', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Vi.png'
  },
  {
    id: 'Viego',
    name: 'Viego',
    roles: ['JUNGLE'],
    winRate: 0.49,
    pickRate: 0.10,
    banRate: 0.06,
    tags: ['Assassin', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Viego.png'
  },
  {
    id: 'Warwick',
    name: 'Warwick',
    roles: ['JUNGLE', 'TOP'],
    winRate: 0.52,
    pickRate: 0.06,
    banRate: 0.03,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Warwick.png'
  },
  {
    id: 'XinZhao',
    name: 'Xin Zhao',
    roles: ['JUNGLE'],
    winRate: 0.51,
    pickRate: 0.06,
    banRate: 0.03,
    tags: ['Fighter', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/XinZhao.png'
  },
  {
    id: 'Zac',
    name: 'Zac',
    roles: ['JUNGLE'],
    winRate: 0.51,
    pickRate: 0.05,
    banRate: 0.03,
    tags: ['Tank', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Zac.png'
  },

  // ===== MID LANERS =====
  {
    id: 'Ahri',
    name: 'Ahri',
    roles: ['MID'],
    winRate: 0.51,
    pickRate: 0.10,
    banRate: 0.05,
    tags: ['Mage', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Ahri.png'
  },
  {
    id: 'Akali',
    name: 'Akali',
    roles: ['MID', 'TOP'],
    winRate: 0.48,
    pickRate: 0.10,
    banRate: 0.15,
    tags: ['Assassin', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Akali.png'
  },
  {
    id: 'Anivia',
    name: 'Anivia',
    roles: ['MID'],
    winRate: 0.52,
    pickRate: 0.04,
    banRate: 0.02,
    tags: ['Mage', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Anivia.png'
  },
  {
    id: 'Annie',
    name: 'Annie',
    roles: ['MID', 'SUPPORT'],
    winRate: 0.52,
    pickRate: 0.04,
    banRate: 0.02,
    tags: ['Mage', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Annie.png'
  },
  {
    id: 'Aurelion Sol',
    name: 'Aurelion Sol',
    roles: ['MID'],
    winRate: 0.51,
    pickRate: 0.06,
    banRate: 0.08,
    tags: ['Mage', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/AurelionSol.png'
  },
  {
    id: 'Azir',
    name: 'Azir',
    roles: ['MID'],
    winRate: 0.47,
    pickRate: 0.05,
    banRate: 0.03,
    tags: ['Mage', 'Marksman'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Azir.png'
  },
  {
    id: 'Cassiopeia',
    name: 'Cassiopeia',
    roles: ['MID'],
    winRate: 0.50,
    pickRate: 0.04,
    banRate: 0.02,
    tags: ['Mage', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Cassiopeia.png'
  },
  {
    id: 'Diana',
    name: 'Diana',
    roles: ['MID', 'JUNGLE'],
    winRate: 0.51,
    pickRate: 0.07,
    banRate: 0.04,
    tags: ['Fighter', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Diana.png'
  },
  {
    id: 'Ekko',
    name: 'Ekko',
    roles: ['MID', 'JUNGLE'],
    winRate: 0.50,
    pickRate: 0.08,
    banRate: 0.05,
    tags: ['Assassin', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Ekko.png'
  },
  {
    id: 'Fizz',
    name: 'Fizz',
    roles: ['MID'],
    winRate: 0.51,
    pickRate: 0.06,
    banRate: 0.06,
    tags: ['Assassin', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Fizz.png'
  },
  {
    id: 'Galio',
    name: 'Galio',
    roles: ['MID', 'SUPPORT'],
    winRate: 0.51,
    pickRate: 0.05,
    banRate: 0.03,
    tags: ['Tank', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Galio.png'
  },
  {
    id: 'Hwei',
    name: 'Hwei',
    roles: ['MID', 'SUPPORT'],
    winRate: 0.49,
    pickRate: 0.08,
    banRate: 0.06,
    tags: ['Mage', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Hwei.png'
  },
  {
    id: 'Kassadin',
    name: 'Kassadin',
    roles: ['MID'],
    winRate: 0.50,
    pickRate: 0.05,
    banRate: 0.05,
    tags: ['Assassin', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Kassadin.png'
  },
  {
    id: 'Katarina',
    name: 'Katarina',
    roles: ['MID'],
    winRate: 0.50,
    pickRate: 0.08,
    banRate: 0.10,
    tags: ['Assassin', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Katarina.png'
  },
  {
    id: 'LeBlanc',
    name: 'LeBlanc',
    roles: ['MID'],
    winRate: 0.49,
    pickRate: 0.08,
    banRate: 0.08,
    tags: ['Assassin', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Leblanc.png'
  },
  {
    id: 'Lissandra',
    name: 'Lissandra',
    roles: ['MID'],
    winRate: 0.50,
    pickRate: 0.04,
    banRate: 0.02,
    tags: ['Mage', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Lissandra.png'
  },
  {
    id: 'Lux',
    name: 'Lux',
    roles: ['MID', 'SUPPORT'],
    winRate: 0.50,
    pickRate: 0.15,
    banRate: 0.05,
    tags: ['Mage', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Lux.png'
  },
  {
    id: 'Malzahar',
    name: 'Malzahar',
    roles: ['MID'],
    winRate: 0.52,
    pickRate: 0.05,
    banRate: 0.06,
    tags: ['Mage', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Malzahar.png'
  },
  {
    id: 'Orianna',
    name: 'Orianna',
    roles: ['MID'],
    winRate: 0.49,
    pickRate: 0.07,
    banRate: 0.03,
    tags: ['Mage', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Orianna.png'
  },
  {
    id: 'Qiyana',
    name: 'Qiyana',
    roles: ['MID'],
    winRate: 0.49,
    pickRate: 0.05,
    banRate: 0.04,
    tags: ['Assassin', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Qiyana.png'
  },
  {
    id: 'Ryze',
    name: 'Ryze',
    roles: ['MID'],
    winRate: 0.46,
    pickRate: 0.03,
    banRate: 0.01,
    tags: ['Mage', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Ryze.png'
  },
  {
    id: 'Sylas',
    name: 'Sylas',
    roles: ['MID', 'JUNGLE'],
    winRate: 0.50,
    pickRate: 0.12,
    banRate: 0.10,
    tags: ['Mage', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Sylas.png'
  },
  {
    id: 'Syndra',
    name: 'Syndra',
    roles: ['MID'],
    winRate: 0.49,
    pickRate: 0.08,
    banRate: 0.05,
    tags: ['Mage', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Syndra.png'
  },
  {
    id: 'Talon',
    name: 'Talon',
    roles: ['MID', 'JUNGLE'],
    winRate: 0.50,
    pickRate: 0.06,
    banRate: 0.04,
    tags: ['Assassin', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Talon.png'
  },
  {
    id: 'TwistedFate',
    name: 'Twisted Fate',
    roles: ['MID'],
    winRate: 0.49,
    pickRate: 0.05,
    banRate: 0.02,
    tags: ['Mage', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/TwistedFate.png'
  },
  {
    id: 'Veigar',
    name: 'Veigar',
    roles: ['MID'],
    winRate: 0.52,
    pickRate: 0.06,
    banRate: 0.05,
    tags: ['Mage', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Veigar.png'
  },
  {
    id: 'Vex',
    name: 'Vex',
    roles: ['MID'],
    winRate: 0.51,
    pickRate: 0.05,
    banRate: 0.04,
    tags: ['Mage', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Vex.png'
  },
  {
    id: 'Viktor',
    name: 'Viktor',
    roles: ['MID'],
    winRate: 0.50,
    pickRate: 0.05,
    banRate: 0.03,
    tags: ['Mage', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Viktor.png'
  },
  {
    id: 'Vladimir',
    name: 'Vladimir',
    roles: ['MID', 'TOP'],
    winRate: 0.50,
    pickRate: 0.05,
    banRate: 0.04,
    tags: ['Mage', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Vladimir.png'
  },
  {
    id: 'Xerath',
    name: 'Xerath',
    roles: ['MID', 'SUPPORT'],
    winRate: 0.51,
    pickRate: 0.05,
    banRate: 0.04,
    tags: ['Mage', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Xerath.png'
  },
  {
    id: 'Yasuo',
    name: 'Yasuo',
    roles: ['MID', 'TOP'],
    winRate: 0.49,
    pickRate: 0.12,
    banRate: 0.15,
    tags: ['Fighter', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Yasuo.png'
  },
  {
    id: 'Zed',
    name: 'Zed',
    roles: ['MID'],
    winRate: 0.51,
    pickRate: 0.12,
    banRate: 0.30,
    tags: ['Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Zed.png'
  },
  {
    id: 'Zoe',
    name: 'Zoe',
    roles: ['MID'],
    winRate: 0.49,
    pickRate: 0.05,
    banRate: 0.04,
    tags: ['Mage', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Zoe.png'
  },

  // ===== ADC / MARKSMEN =====
  {
    id: 'Aphelios',
    name: 'Aphelios',
    roles: ['ADC'],
    winRate: 0.48,
    pickRate: 0.07,
    banRate: 0.05,
    tags: ['Marksman', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Aphelios.png'
  },
  {
    id: 'Ashe',
    name: 'Ashe',
    roles: ['ADC', 'SUPPORT'],
    winRate: 0.52,
    pickRate: 0.15,
    banRate: 0.08,
    tags: ['Marksman', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Ashe.png'
  },
  {
    id: 'Caitlyn',
    name: 'Caitlyn',
    roles: ['ADC'],
    winRate: 0.48,
    pickRate: 0.20,
    banRate: 0.10,
    tags: ['Marksman'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Caitlyn.png'
  },
  {
    id: 'Draven',
    name: 'Draven',
    roles: ['ADC'],
    winRate: 0.50,
    pickRate: 0.08,
    banRate: 0.06,
    tags: ['Marksman', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Draven.png'
  },
  {
    id: 'Ezreal',
    name: 'Ezreal',
    roles: ['ADC'],
    winRate: 0.49,
    pickRate: 0.30,
    banRate: 0.05,
    tags: ['Marksman', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Ezreal.png'
  },
  {
    id: 'Jhin',
    name: 'Jhin',
    roles: ['ADC'],
    winRate: 0.51,
    pickRate: 0.18,
    banRate: 0.04,
    tags: ['Marksman', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Jhin.png'
  },
  {
    id: 'Jinx',
    name: 'Jinx',
    roles: ['ADC'],
    winRate: 0.53,
    pickRate: 0.25,
    banRate: 0.05,
    tags: ['Marksman'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Jinx.png'
  },
  {
    id: 'Kaisa',
    name: "Kai'Sa",
    roles: ['ADC'],
    winRate: 0.49,
    pickRate: 0.25,
    banRate: 0.05,
    tags: ['Marksman'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Kaisa.png'
  },
  {
    id: 'Kalista',
    name: 'Kalista',
    roles: ['ADC'],
    winRate: 0.47,
    pickRate: 0.04,
    banRate: 0.03,
    tags: ['Marksman', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Kalista.png'
  },
  {
    id: 'KogMaw',
    name: "Kog'Maw",
    roles: ['ADC'],
    winRate: 0.51,
    pickRate: 0.04,
    banRate: 0.02,
    tags: ['Marksman', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/KogMaw.png'
  },
  {
    id: 'Lucian',
    name: 'Lucian',
    roles: ['ADC', 'MID'],
    winRate: 0.49,
    pickRate: 0.12,
    banRate: 0.04,
    tags: ['Marksman', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Lucian.png'
  },
  {
    id: 'MissFortune',
    name: 'Miss Fortune',
    roles: ['ADC'],
    winRate: 0.52,
    pickRate: 0.15,
    banRate: 0.05,
    tags: ['Marksman', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/MissFortune.png'
  },
  {
    id: 'Nilah',
    name: 'Nilah',
    roles: ['ADC'],
    winRate: 0.51,
    pickRate: 0.04,
    banRate: 0.02,
    tags: ['Fighter', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Nilah.png'
  },
  {
    id: 'Samira',
    name: 'Samira',
    roles: ['ADC'],
    winRate: 0.50,
    pickRate: 0.10,
    banRate: 0.08,
    tags: ['Marksman', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Samira.png'
  },
  {
    id: 'Sivir',
    name: 'Sivir',
    roles: ['ADC'],
    winRate: 0.50,
    pickRate: 0.06,
    banRate: 0.02,
    tags: ['Marksman'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Sivir.png'
  },
  {
    id: 'Smolder',
    name: 'Smolder',
    roles: ['ADC'],
    winRate: 0.47,
    pickRate: 0.12,
    banRate: 0.15,
    tags: ['Marksman', 'Mage'],
    imageUrl: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data/7cef5337e65fb08e2785896861c5ea76f983bea8-496x560.jpg?accountingTag=LoL&auto=format&fit=fill&q=80&w=496'
  },
  {
    id: 'Tristana',
    name: 'Tristana',
    roles: ['ADC', 'MID'],
    winRate: 0.50,
    pickRate: 0.08,
    banRate: 0.04,
    tags: ['Marksman', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Tristana.png'
  },
  {
    id: 'Twitch',
    name: 'Twitch',
    roles: ['ADC'],
    winRate: 0.51,
    pickRate: 0.06,
    banRate: 0.03,
    tags: ['Marksman', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Twitch.png'
  },
  {
    id: 'Varus',
    name: 'Varus',
    roles: ['ADC', 'MID'],
    winRate: 0.49,
    pickRate: 0.08,
    banRate: 0.03,
    tags: ['Marksman', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Varus.png'
  },
  {
    id: 'Vayne',
    name: 'Vayne',
    roles: ['ADC', 'TOP'],
    winRate: 0.51,
    pickRate: 0.12,
    banRate: 0.08,
    tags: ['Marksman', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Vayne.png'
  },
  {
    id: 'Xayah',
    name: 'Xayah',
    roles: ['ADC'],
    winRate: 0.50,
    pickRate: 0.08,
    banRate: 0.04,
    tags: ['Marksman', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Xayah.png'
  },
  {
    id: 'Zeri',
    name: 'Zeri',
    roles: ['ADC'],
    winRate: 0.47,
    pickRate: 0.05,
    banRate: 0.08,
    tags: ['Marksman', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Zeri.png'
  },

  // ===== SUPPORTS =====
  {
    id: 'Alistar',
    name: 'Alistar',
    roles: ['SUPPORT'],
    winRate: 0.50,
    pickRate: 0.05,
    banRate: 0.02,
    tags: ['Tank', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Alistar.png'
  },
  {
    id: 'Bard',
    name: 'Bard',
    roles: ['SUPPORT'],
    winRate: 0.51,
    pickRate: 0.06,
    banRate: 0.03,
    tags: ['Support', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Bard.png'
  },
  {
    id: 'Blitzcrank',
    name: 'Blitzcrank',
    roles: ['SUPPORT'],
    winRate: 0.51,
    pickRate: 0.08,
    banRate: 0.15,
    tags: ['Tank', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Blitzcrank.png'
  },
  {
    id: 'Braum',
    name: 'Braum',
    roles: ['SUPPORT'],
    winRate: 0.49,
    pickRate: 0.05,
    banRate: 0.02,
    tags: ['Tank', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Braum.png'
  },
  {
    id: 'Janna',
    name: 'Janna',
    roles: ['SUPPORT'],
    winRate: 0.52,
    pickRate: 0.06,
    banRate: 0.02,
    tags: ['Support', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Janna.png'
  },
  {
    id: 'Karma',
    name: 'Karma',
    roles: ['SUPPORT', 'MID'],
    winRate: 0.49,
    pickRate: 0.06,
    banRate: 0.02,
    tags: ['Mage', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Karma.png'
  },
  {
    id: 'Leona',
    name: 'Leona',
    roles: ['SUPPORT'],
    winRate: 0.51,
    pickRate: 0.10,
    banRate: 0.06,
    tags: ['Tank', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Leona.png'
  },
  {
    id: 'Lulu',
    name: 'Lulu',
    roles: ['SUPPORT'],
    winRate: 0.50,
    pickRate: 0.08,
    banRate: 0.05,
    tags: ['Support', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Lulu.png'
  },
  {
    id: 'Milio',
    name: 'Milio',
    roles: ['SUPPORT'],
    winRate: 0.52,
    pickRate: 0.07,
    banRate: 0.04,
    tags: ['Support', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Milio.png'
  },
  {
    id: 'Morgana',
    name: 'Morgana',
    roles: ['SUPPORT', 'MID'],
    winRate: 0.51,
    pickRate: 0.10,
    banRate: 0.12,
    tags: ['Mage', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Morgana.png'
  },
  {
    id: 'Nami',
    name: 'Nami',
    roles: ['SUPPORT'],
    winRate: 0.52,
    pickRate: 0.08,
    banRate: 0.03,
    tags: ['Support', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Nami.png'
  },
  {
    id: 'Nautilus',
    name: 'Nautilus',
    roles: ['SUPPORT'],
    winRate: 0.50,
    pickRate: 0.12,
    banRate: 0.08,
    tags: ['Tank', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Nautilus.png'
  },
  {
    id: 'Pyke',
    name: 'Pyke',
    roles: ['SUPPORT'],
    winRate: 0.49,
    pickRate: 0.08,
    banRate: 0.10,
    tags: ['Assassin', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Pyke.png'
  },
  {
    id: 'Rakan',
    name: 'Rakan',
    roles: ['SUPPORT'],
    winRate: 0.50,
    pickRate: 0.08,
    banRate: 0.04,
    tags: ['Support', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Rakan.png'
  },
  {
    id: 'Renata',
    name: 'Renata Glasc',
    roles: ['SUPPORT'],
    winRate: 0.50,
    pickRate: 0.05,
    banRate: 0.03,
    tags: ['Support', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Renata.png'
  },
  {
    id: 'Senna',
    name: 'Senna',
    roles: ['SUPPORT', 'ADC'],
    winRate: 0.50,
    pickRate: 0.12,
    banRate: 0.05,
    tags: ['Marksman', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Senna.png'
  },
  {
    id: 'Seraphine',
    name: 'Seraphine',
    roles: ['SUPPORT', 'MID'],
    winRate: 0.51,
    pickRate: 0.08,
    banRate: 0.04,
    tags: ['Mage', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Seraphine.png'
  },
  {
    id: 'Sona',
    name: 'Sona',
    roles: ['SUPPORT'],
    winRate: 0.52,
    pickRate: 0.05,
    banRate: 0.02,
    tags: ['Support', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Sona.png'
  },
  {
    id: 'Soraka',
    name: 'Soraka',
    roles: ['SUPPORT'],
    winRate: 0.52,
    pickRate: 0.06,
    banRate: 0.05,
    tags: ['Support', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Soraka.png'
  },
  {
    id: 'TahmKench',
    name: 'Tahm Kench',
    roles: ['SUPPORT', 'TOP'],
    winRate: 0.50,
    pickRate: 0.04,
    banRate: 0.03,
    tags: ['Tank', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/TahmKench.png'
  },
  {
    id: 'Taric',
    name: 'Taric',
    roles: ['SUPPORT'],
    winRate: 0.51,
    pickRate: 0.03,
    banRate: 0.01,
    tags: ['Tank', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Taric.png'
  },
  {
    id: 'Thresh',
    name: 'Thresh',
    roles: ['SUPPORT'],
    winRate: 0.51,
    pickRate: 0.15,
    banRate: 0.04,
    tags: ['Support', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Thresh.png'
  },
  {
    id: 'Yuumi',
    name: 'Yuumi',
    roles: ['SUPPORT'],
    winRate: 0.48,
    pickRate: 0.05,
    banRate: 0.15,
    tags: ['Support', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Yuumi.png'
  },
  {
    id: 'Zyra',
    name: 'Zyra',
    roles: ['SUPPORT', 'MID'],
    winRate: 0.51,
    pickRate: 0.05,
    banRate: 0.03,
    tags: ['Mage', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Zyra.png'
  },

  // ===== ADDITIONAL CHAMPIONS (Missing from initial list) =====
  {
    id: 'Akshan',
    name: 'Akshan',
    roles: ['MID', 'TOP'],
    winRate: 0.50,
    pickRate: 0.06,
    banRate: 0.04,
    tags: ['Marksman', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Akshan.png'
  },
  {
    id: 'Amumu',
    name: 'Amumu',
    roles: ['JUNGLE', 'SUPPORT'],
    winRate: 0.52,
    pickRate: 0.06,
    banRate: 0.03,
    tags: ['Tank', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Amumu.png'
  },
  {
    id: 'Aurora',
    name: 'Aurora',
    roles: ['MID', 'TOP'],
    winRate: 0.49,
    pickRate: 0.08,
    banRate: 0.12,
    tags: ['Mage', 'Assassin'],
    imageUrl: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data/2984fc54c2eccfed432ac8a78e90757b574178c4-418x473.jpg?accountingTag=LoL&auto=format&fit=fill&q=80&w=418'
  },
  {
    id: 'BelVeth',
    name: "Bel'Veth",
    roles: ['JUNGLE'],
    winRate: 0.50,
    pickRate: 0.06,
    banRate: 0.08,
    tags: ['Fighter', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Belveth.png'
  },
  {
    id: 'Brand',
    name: 'Brand',
    roles: ['SUPPORT', 'MID'],
    winRate: 0.51,
    pickRate: 0.07,
    banRate: 0.05,
    tags: ['Mage', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Brand.png'
  },
  {
    id: 'Briar',
    name: 'Briar',
    roles: ['JUNGLE'],
    winRate: 0.50,
    pickRate: 0.07,
    banRate: 0.10,
    tags: ['Fighter', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Briar.png'
  },
  {
    id: 'ChoGath',
    name: "Cho'Gath",
    roles: ['TOP', 'MID'],
    winRate: 0.51,
    pickRate: 0.05,
    banRate: 0.03,
    tags: ['Tank', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Chogath.png'
  },
  {
    id: 'Corki',
    name: 'Corki',
    roles: ['MID', 'ADC'],
    winRate: 0.49,
    pickRate: 0.04,
    banRate: 0.02,
    tags: ['Marksman', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Corki.png'
  },
  {
    id: 'DrMundo',
    name: 'Dr. Mundo',
    roles: ['TOP', 'JUNGLE'],
    winRate: 0.51,
    pickRate: 0.05,
    banRate: 0.03,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/DrMundo.png'
  },
  {
    id: 'Fiddlesticks',
    name: 'Fiddlesticks',
    roles: ['JUNGLE'],
    winRate: 0.51,
    pickRate: 0.05,
    banRate: 0.04,
    tags: ['Mage', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Fiddlesticks.png'
  },
  {
    id: 'Gragas',
    name: 'Gragas',
    roles: ['JUNGLE', 'TOP', 'MID'],
    winRate: 0.50,
    pickRate: 0.05,
    banRate: 0.03,
    tags: ['Fighter', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Gragas.png'
  },
  {
    id: 'Heimerdinger',
    name: 'Heimerdinger',
    roles: ['MID', 'TOP', 'SUPPORT'],
    winRate: 0.51,
    pickRate: 0.03,
    banRate: 0.02,
    tags: ['Mage', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Heimerdinger.png'
  },
  {
    id: 'Ivern',
    name: 'Ivern',
    roles: ['JUNGLE'],
    winRate: 0.52,
    pickRate: 0.02,
    banRate: 0.01,
    tags: ['Support', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Ivern.png'
  },
  {
    id: 'Karthus',
    name: 'Karthus',
    roles: ['JUNGLE', 'MID'],
    winRate: 0.50,
    pickRate: 0.04,
    banRate: 0.03,
    tags: ['Mage', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Karthus.png'
  },
  {
    id: 'Kayle',
    name: 'Kayle',
    roles: ['TOP', 'MID'],
    winRate: 0.51,
    pickRate: 0.04,
    banRate: 0.03,
    tags: ['Fighter', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Kayle.png'
  },
  {
    id: 'Kled',
    name: 'Kled',
    roles: ['TOP'],
    winRate: 0.50,
    pickRate: 0.03,
    banRate: 0.02,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Kled.png'
  },
  {
    id: 'Maokai',
    name: 'Maokai',
    roles: ['SUPPORT', 'JUNGLE', 'TOP'],
    winRate: 0.51,
    pickRate: 0.06,
    banRate: 0.05,
    tags: ['Tank', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Maokai.png'
  },
  {
    id: 'Mel',
    name: 'Mel',
    roles: ['SUPPORT', 'MID'],
    winRate: 0.48,
    pickRate: 0.10,
    banRate: 0.15,
    tags: ['Mage', 'Support'],
    imageUrl: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data/52ef003ccb9a9464bbb87d72ded0e4ae11b4fe32-496x560.png?accountingTag=LoL&auto=format&fit=fill&q=80&w=496'
  },
  {
    id: 'Naafiri',
    name: 'Naafiri',
    roles: ['MID', 'JUNGLE'],
    winRate: 0.50,
    pickRate: 0.04,
    banRate: 0.03,
    tags: ['Assassin', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Naafiri.png'
  },
  {
    id: 'Neeko',
    name: 'Neeko',
    roles: ['MID', 'SUPPORT'],
    winRate: 0.51,
    pickRate: 0.04,
    banRate: 0.03,
    tags: ['Mage', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Neeko.png'
  },
  {
    id: 'Olaf',
    name: 'Olaf',
    roles: ['TOP', 'JUNGLE'],
    winRate: 0.50,
    pickRate: 0.04,
    banRate: 0.02,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Olaf.png'
  },
  {
    id: 'Pantheon',
    name: 'Pantheon',
    roles: ['TOP', 'MID', 'SUPPORT'],
    winRate: 0.50,
    pickRate: 0.06,
    banRate: 0.04,
    tags: ['Fighter', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Pantheon.png'
  },
  {
    id: 'Poppy',
    name: 'Poppy',
    roles: ['TOP', 'JUNGLE', 'SUPPORT'],
    winRate: 0.51,
    pickRate: 0.04,
    banRate: 0.02,
    tags: ['Tank', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Poppy.png'
  },
  {
    id: 'Quinn',
    name: 'Quinn',
    roles: ['TOP'],
    winRate: 0.51,
    pickRate: 0.02,
    banRate: 0.01,
    tags: ['Marksman', 'Assassin'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Quinn.png'
  },
  {
    id: 'Rammus',
    name: 'Rammus',
    roles: ['JUNGLE'],
    winRate: 0.52,
    pickRate: 0.04,
    banRate: 0.03,
    tags: ['Tank', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Rammus.png'
  },
  {
    id: 'Shyvana',
    name: 'Shyvana',
    roles: ['JUNGLE'],
    winRate: 0.50,
    pickRate: 0.03,
    banRate: 0.02,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Shyvana.png'
  },
  {
    id: 'Singed',
    name: 'Singed',
    roles: ['TOP'],
    winRate: 0.51,
    pickRate: 0.02,
    banRate: 0.01,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Singed.png'
  },
  {
    id: 'Sion',
    name: 'Sion',
    roles: ['TOP'],
    winRate: 0.50,
    pickRate: 0.04,
    banRate: 0.02,
    tags: ['Tank', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Sion.png'
  },
  {
    id: 'Skarner',
    name: 'Skarner',
    roles: ['JUNGLE', 'TOP'],
    winRate: 0.50,
    pickRate: 0.04,
    banRate: 0.05,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Skarner.png'
  },
  {
    id: 'Swain',
    name: 'Swain',
    roles: ['SUPPORT', 'MID', 'ADC'],
    winRate: 0.51,
    pickRate: 0.05,
    banRate: 0.03,
    tags: ['Mage', 'Fighter'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Swain.png'
  },
  {
    id: 'Taliyah',
    name: 'Taliyah',
    roles: ['JUNGLE', 'MID'],
    winRate: 0.50,
    pickRate: 0.03,
    banRate: 0.02,
    tags: ['Mage', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Taliyah.png'
  },
  {
    id: 'Trundle',
    name: 'Trundle',
    roles: ['JUNGLE', 'TOP'],
    winRate: 0.51,
    pickRate: 0.04,
    banRate: 0.02,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Trundle.png'
  },
  {
    id: 'VelKoz',
    name: "Vel'Koz",
    roles: ['SUPPORT', 'MID'],
    winRate: 0.51,
    pickRate: 0.03,
    banRate: 0.02,
    tags: ['Mage', 'Support'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Velkoz.png'
  },
  {
    id: 'Wukong',
    name: 'Wukong',
    roles: ['JUNGLE', 'TOP'],
    winRate: 0.51,
    pickRate: 0.04,
    banRate: 0.03,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/MonkeyKing.png'
  },
  {
    id: 'Yorick',
    name: 'Yorick',
    roles: ['TOP'],
    winRate: 0.51,
    pickRate: 0.03,
    banRate: 0.02,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Yorick.png'
  },
  {
    id: 'Ziggs',
    name: 'Ziggs',
    roles: ['MID', 'ADC'],
    winRate: 0.50,
    pickRate: 0.04,
    banRate: 0.02,
    tags: ['Mage', 'Marksman'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Ziggs.png'
  },
  {
    id: 'Zilean',
    name: 'Zilean',
    roles: ['SUPPORT', 'MID'],
    winRate: 0.52,
    pickRate: 0.03,
    banRate: 0.02,
    tags: ['Support', 'Mage'],
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Zilean.png'
  },
  {
    id: 'Yunara',
    name: 'Yunara',
    roles: ['MID', 'SUPPORT'],
    winRate: 0.48,
    pickRate: 0.06,
    banRate: 0.08,
    tags: ['Mage', 'Support'],
    imageUrl: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data_live/b3381de96aebe82cfc71c513b9a6bf4cf408e445-496x560.jpg?accountingTag=LoL&auto=format&fit=fill&q=80&w=496'
  },
  {
    id: 'Zaahen',
    name: 'Zaahen',
    roles: ['TOP', 'JUNGLE'],
    winRate: 0.49,
    pickRate: 0.08,
    banRate: 0.12,
    tags: ['Fighter', 'Tank'],
    imageUrl: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data_live/eb649092d2b70f9d9c417c1007425acd5634013d-956x1080.jpg?accountingTag=LoL&auto=format&fit=fill&q=80&w=528'
  }
];
