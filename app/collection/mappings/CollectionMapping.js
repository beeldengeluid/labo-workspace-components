//media suite configs

import DANSOralHistoryConfig from "./DANSOralHistoryConfig";

import EYEDesmetAfficheConfig from "./EYEDesmetAfficheConfig";
import EYEDesmetFilmConfig from "./EYEDesmetFilmConfig";
import EYEDesmetPapersPageConfig from "./EYEDesmetPapersPageConfig";

import KBNewspaperAggrConfig from "./KBNewspaperAggrConfig";

import NISVDAANCatalogueConfig from "./NISVDAANCatalogueConfig";
import NISVDAANTweedeKamerConfig from "./NISVDAANTweedeKamerConfig";
import NISVProgramGuideBlockConfig from "./NISVProgramGuideBlockConfig";
import MetamorfozeProgramGuideConfig from "./MetamorfozeProgramGuideConfig";

import OpenBeeldenNISVConfig from "./OpenBeeldenNISVConfig";

//non media suite collections
import KijkEnLuisterCijfersConfig from "./KijkEnLuisterCijfersConfig";
import RVDFilmContractsConfig from "./RVDFilmContractsConfig";
import SoundbitesConfig from "./SoundbitesConfig";
import RadioOranjeConfig from "./RadioOranjeConfig";
import NIODMediaOorlogConfig from "./NIODMediaOorlogConfig";

//TODO think about what happens to aliases
const CollectionMapping = {
  "daan-catalogue-radio": NISVDAANCatalogueConfig,
  "daan-catalogue-tv": NISVDAANCatalogueConfig,
  "daan-catalogue-aggr": NISVDAANCatalogueConfig,
  "daan-catalogue-tweede-kamer": NISVDAANTweedeKamerConfig,
  "nisv-program-guides-new": NISVProgramGuideBlockConfig,
  "program-guides-metamorfoze*": MetamorfozeProgramGuideConfig,
  "eye-desmet-affiches": EYEDesmetAfficheConfig,
  "eye-desmet-films": EYEDesmetFilmConfig,
  "eye-desmet-papers4": EYEDesmetPapersPageConfig,
  "rvd-collection*": RVDFilmContractsConfig,
  "open-beelden-beeldengeluid": OpenBeeldenNISVConfig,
  "open-beelden-eye": OpenBeeldenNISVConfig,
  "open-beelden-stichting-natuurbeelden": OpenBeeldenNISVConfig,
  "kb-newspapers*": KBNewspaperAggrConfig,
  "dans*": DANSOralHistoryConfig,
  kijkenluistercijfers: KijkEnLuisterCijfersConfig,
  "kijkenluistercijfers*": KijkEnLuisterCijfersConfig,
  soundbites: SoundbitesConfig,
  "radio-oranje": RadioOranjeConfig,
  "niod-mediaoorlog*": NIODMediaOorlogConfig,
};

export default CollectionMapping;
