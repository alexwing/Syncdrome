export interface AlertModel {
  title: string;
  message: string;
  type: "danger" | "success" | "warning";
}

export interface Commit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    committer: {
      date: string;
    };
  };
}

export interface DrivesProps {
  conected: boolean;
  letter: string;
  name: string;
  freeSpace: number;
  size: number;
  sync: boolean;
  syncDate: string;
  onlyMedia: boolean;
}


export interface AlertMessageProps {
  show: boolean;
  alertMessage: AlertModel;
  onHide: () => void;
  autoClose?: number ;
}

export interface FileType {
  icon: string;
  color: string;
  extensions: string[];
}

export interface FileTypes {
  [key: string]: FileType;
}

export interface Bookmark {
    id: Number | null;
    name: string;
    path: string;
    volume: string;
    description: string;
}

/*
{
    "CrucialX6.txt": {
        "connected": "F:",
        "content": {
            "backup\\Pictures\\IA": [
                {
                    "name": "asimov",
                    "fileName": "asimov.psd",
                    "folder": "backup\\Pictures\\IA",
                    "extension": "psd"
                }
            ],
            "backup\\Pictures\\Movil\\FOTOS MÓVIL ALE\\Books\\MoonReader": [
                {
                    "name": "Alpha Centauri, la estrella mas proxima   Asimov  Isaac",
                    "fileName": "Alpha Centauri, la estrella mas proxima - Asimov_ Isaac.epub",
                    "folder": "backup\\Pictures\\Movil\\FOTOS MÓVIL ALE\\Books\\MoonReader",
                    "extension": "epub"
                },
                {
                    "name": "La Edad del Futuro I   Asimov  Isaac",
                    "fileName": "La Edad del Futuro I - Asimov_ Isaac.epub",
                    "folder": "backup\\Pictures\\Movil\\FOTOS MÓVIL ALE\\Books\\MoonReader",
                    "extension": "epub"
                }
            ],
            "backup\\Galaxy\\Books\\MoonReader": [
                {
                    "name": "Alpha Centauri, la estrella mas proxima   Asimov  Isaac",
                    "fileName": "Alpha Centauri, la estrella mas proxima - Asimov_ Isaac.epub",
                    "folder": "backup\\Galaxy\\Books\\MoonReader",
                    "extension": "epub"
                },
                {
                    "name": "La Edad del Futuro I   Asimov  Isaac",
                    "fileName": "La Edad del Futuro I - Asimov_ Isaac.epub",
                    "folder": "backup\\Galaxy\\Books\\MoonReader",
                    "extension": "epub"
                }
            ],
            "Software\\Recursos\\Fuentes\\15000 Fuentes\\fonts\\A": [
                {
                    "name": "ASIMOV",
                    "fileName": "ASIMOV.TTF",
                    "folder": "Software\\Recursos\\Fuentes\\15000 Fuentes\\fonts\\A",
                    "extension": "TTF"
                }
            ],
            "Software\\Recursos\\Fuentes\\15000 Fuentes\\fonts\\TRUETYPE.A": [
                {
                    "name": "ASIMOV",
                    "fileName": "ASIMOV.TTF",
                    "folder": "Software\\Recursos\\Fuentes\\15000 Fuentes\\fonts\\TRUETYPE.A",
                    "extension": "TTF"
                }
            ]
        }
    },
    "ExternoHP.txt": {
        "connected": "",
        "content": {
            "I:\\Biblioteca de calibre\\Asimov, Isaac": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\100 Preguntas Basicas Sobre La Cien (2688)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Alpha Centauri, la estrella mas pro (2689)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Anochecer (2691)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Breve historia de la quimica (2693)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Civilizaciones Extraterrestres (2695)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Como Descubrimos Los Numeros (2697)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Constantinopla, El imperio olvidado (2698)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\De los numeros y su historia (2699)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\El codigo genetico (2700)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\El electron es zurdo y otros ensayo (2701)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\El hombre bicentenario (2702)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\El Imperio Romano (2703)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\El monstruo subatomico (2601)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\El Planeta Que No Estaba (2604)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\El secreto del universo (2605)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\El Sol brilla luminoso (2606)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Fotosintesis (2608)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Fundacion 1 - Fundacion (2609)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Fundacion 2 - Fundacion e Imperio (2610)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Fundacion 3 - Segunda fundacion (2611)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Fundacion 4 - Los limites de la fun (2612)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Fundacion 5 - Fundacion y Tierra (2613)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Fundacion 6 - Preludio A La Fundaci (2614)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Fundacion 7 - Hacia La Fundacion (2615)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Grandes Ideas De La Ciencia (2616)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Guia de la Biblia Antiguo Testament (2617)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Guia De La Biblia Nuevo Testamento (2618)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Historia de los egipcios (2620)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Historia universal Asimov_ El Imper (2621)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Historia universal Asimov_ La Repub (2623)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Introduccion A La Ciencia (Vol I) (2624)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Introduccion A La Ciencia (Vol II) (2628)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\La Busqueda de los Elementos (2630)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\La Edad del Futuro I (2631)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\La Edad del Futuro II (2634)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\La estrella de Belen y otros ensayo (2635)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\La Medicion Del Universo (2638)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\La Receta del Tiranosauro (2639)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\La Receta del Tiranosauro II (2640)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\La Receta del Tiranosauro III (2643)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\La Relatividad Del Error (2644)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\La Tierra de Canaan (2648)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\La tragedia de la Luna (2650)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\La ultima pregunta (2652)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Momentos estelares de la ciencia (2654)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Soplo mortal (2656)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\Yo, Robot (2657)": [],
            "I:\\Biblioteca de calibre\\Asimov, Isaac\\_Hay Alguien Ahi_ (2658)": [],
            "Biblioteca de calibre\\Asimov, Isaac\\100 Preguntas Basicas Sobre La Cien (2688)": [
                {
                    "name": "100 Preguntas Basicas Sobre La    Asimov, Isaac",
                    "fileName": "100 Preguntas Basicas Sobre La  - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\100 Preguntas Basicas Sobre La Cien (2688)",
                    "extension": "epub"
                },
                {
                    "name": "100 Preguntas Basicas Sobre La    Asimov, Isaac",
                    "fileName": "100 Preguntas Basicas Sobre La  - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\100 Preguntas Basicas Sobre La Cien (2688)",
                    "extension": "mobi"
                },
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\100 Preguntas Basicas Sobre La Cien (2688)",
                    "extension": "jpg"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\100 Preguntas Basicas Sobre La Cien (2688)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Alpha Centauri, la estrella mas pro (2689)": [
                {
                    "name": "Alpha Centauri, la estrella mas   Asimov, Isaac",
                    "fileName": "Alpha Centauri, la estrella mas - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Alpha Centauri, la estrella mas pro (2689)",
                    "extension": "epub"
                },
                {
                    "name": "Alpha Centauri, la estrella mas   Asimov, Isaac",
                    "fileName": "Alpha Centauri, la estrella mas - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Alpha Centauri, la estrella mas pro (2689)",
                    "extension": "mobi"
                },
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Alpha Centauri, la estrella mas pro (2689)",
                    "extension": "jpg"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Alpha Centauri, la estrella mas pro (2689)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Anochecer (2691)": [
                {
                    "name": "Anochecer   Asimov, Isaac",
                    "fileName": "Anochecer - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Anochecer (2691)",
                    "extension": "epub"
                },
                {
                    "name": "Anochecer   Asimov, Isaac",
                    "fileName": "Anochecer - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Anochecer (2691)",
                    "extension": "mobi"
                },
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Anochecer (2691)",
                    "extension": "jpg"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Anochecer (2691)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Breve historia de la quimica (2693)": [
                {
                    "name": "Breve historia de la quimica   Asimov, Isaac",
                    "fileName": "Breve historia de la quimica - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Breve historia de la quimica (2693)",
                    "extension": "epub"
                },
                {
                    "name": "Breve historia de la quimica   Asimov, Isaac",
                    "fileName": "Breve historia de la quimica - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Breve historia de la quimica (2693)",
                    "extension": "mobi"
                },
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Breve historia de la quimica (2693)",
                    "extension": "jpg"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Breve historia de la quimica (2693)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Civilizaciones Extraterrestres (2695)": [
                {
                    "name": "Civilizaciones Extraterrestres   Asimov, Isaac",
                    "fileName": "Civilizaciones Extraterrestres - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Civilizaciones Extraterrestres (2695)",
                    "extension": "epub"
                },
                {
                    "name": "Civilizaciones Extraterrestres   Asimov, Isaac",
                    "fileName": "Civilizaciones Extraterrestres - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Civilizaciones Extraterrestres (2695)",
                    "extension": "mobi"
                },
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Civilizaciones Extraterrestres (2695)",
                    "extension": "jpg"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Civilizaciones Extraterrestres (2695)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Como Descubrimos Los Numeros (2697)": [
                {
                    "name": "Como Descubrimos Los Numeros   Asimov, Isaac",
                    "fileName": "Como Descubrimos Los Numeros - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Como Descubrimos Los Numeros (2697)",
                    "extension": "epub"
                },
                {
                    "name": "Como Descubrimos Los Numeros   Asimov, Isaac",
                    "fileName": "Como Descubrimos Los Numeros - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Como Descubrimos Los Numeros (2697)",
                    "extension": "mobi"
                },
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Como Descubrimos Los Numeros (2697)",
                    "extension": "jpg"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Como Descubrimos Los Numeros (2697)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Constantinopla, El imperio olvidado (2698)": [
                {
                    "name": "Constantinopla, El imperio olvi   Asimov, Isaac",
                    "fileName": "Constantinopla, El imperio olvi - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Constantinopla, El imperio olvidado (2698)",
                    "extension": "epub"
                },
                {
                    "name": "Constantinopla, El imperio olvi   Asimov, Isaac",
                    "fileName": "Constantinopla, El imperio olvi - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Constantinopla, El imperio olvidado (2698)",
                    "extension": "mobi"
                },
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Constantinopla, El imperio olvidado (2698)",
                    "extension": "jpg"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Constantinopla, El imperio olvidado (2698)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\De los numeros y su historia (2699)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\De los numeros y su historia (2699)",
                    "extension": "jpg"
                },
                {
                    "name": "De los numeros y su historia   Asimov, Isaac",
                    "fileName": "De los numeros y su historia - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\De los numeros y su historia (2699)",
                    "extension": "epub"
                },
                {
                    "name": "De los numeros y su historia   Asimov, Isaac",
                    "fileName": "De los numeros y su historia - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\De los numeros y su historia (2699)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\De los numeros y su historia (2699)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\El codigo genetico (2700)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El codigo genetico (2700)",
                    "extension": "jpg"
                },
                {
                    "name": "El codigo genetico   Asimov, Isaac",
                    "fileName": "El codigo genetico - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El codigo genetico (2700)",
                    "extension": "epub"
                },
                {
                    "name": "El codigo genetico   Asimov, Isaac",
                    "fileName": "El codigo genetico - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El codigo genetico (2700)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El codigo genetico (2700)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\El electron es zurdo y otros ensayo (2701)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El electron es zurdo y otros ensayo (2701)",
                    "extension": "jpg"
                },
                {
                    "name": "El electron es zurdo y otros en   Asimov, Isaac",
                    "fileName": "El electron es zurdo y otros en - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El electron es zurdo y otros ensayo (2701)",
                    "extension": "epub"
                },
                {
                    "name": "El electron es zurdo y otros en   Asimov, Isaac",
                    "fileName": "El electron es zurdo y otros en - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El electron es zurdo y otros ensayo (2701)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El electron es zurdo y otros ensayo (2701)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\El hombre bicentenario (2702)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El hombre bicentenario (2702)",
                    "extension": "jpg"
                },
                {
                    "name": "El hombre bicentenario   Asimov, Isaac",
                    "fileName": "El hombre bicentenario - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El hombre bicentenario (2702)",
                    "extension": "epub"
                },
                {
                    "name": "El hombre bicentenario   Asimov, Isaac",
                    "fileName": "El hombre bicentenario - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El hombre bicentenario (2702)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El hombre bicentenario (2702)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\El Imperio Romano (2703)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El Imperio Romano (2703)",
                    "extension": "jpg"
                },
                {
                    "name": "El Imperio Romano   Asimov, Isaac",
                    "fileName": "El Imperio Romano - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El Imperio Romano (2703)",
                    "extension": "epub"
                },
                {
                    "name": "El Imperio Romano   Asimov, Isaac",
                    "fileName": "El Imperio Romano - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El Imperio Romano (2703)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El Imperio Romano (2703)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\El monstruo subatomico (2601)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El monstruo subatomico (2601)",
                    "extension": "jpg"
                },
                {
                    "name": "El monstruo subatomico   Asimov, Isaac",
                    "fileName": "El monstruo subatomico - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El monstruo subatomico (2601)",
                    "extension": "epub"
                },
                {
                    "name": "El monstruo subatomico   Asimov, Isaac",
                    "fileName": "El monstruo subatomico - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El monstruo subatomico (2601)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El monstruo subatomico (2601)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\El Planeta Que No Estaba (2604)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El Planeta Que No Estaba (2604)",
                    "extension": "jpg"
                },
                {
                    "name": "El Planeta Que No Estaba   Asimov, Isaac",
                    "fileName": "El Planeta Que No Estaba - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El Planeta Que No Estaba (2604)",
                    "extension": "epub"
                },
                {
                    "name": "El Planeta Que No Estaba   Asimov, Isaac",
                    "fileName": "El Planeta Que No Estaba - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El Planeta Que No Estaba (2604)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El Planeta Que No Estaba (2604)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\El secreto del universo (2605)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El secreto del universo (2605)",
                    "extension": "jpg"
                },
                {
                    "name": "El secreto del universo   Asimov, Isaac",
                    "fileName": "El secreto del universo - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El secreto del universo (2605)",
                    "extension": "epub"
                },
                {
                    "name": "El secreto del universo   Asimov, Isaac",
                    "fileName": "El secreto del universo - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El secreto del universo (2605)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El secreto del universo (2605)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\El Sol brilla luminoso (2606)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El Sol brilla luminoso (2606)",
                    "extension": "jpg"
                },
                {
                    "name": "El Sol brilla luminoso   Asimov, Isaac",
                    "fileName": "El Sol brilla luminoso - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El Sol brilla luminoso (2606)",
                    "extension": "epub"
                },
                {
                    "name": "El Sol brilla luminoso   Asimov, Isaac",
                    "fileName": "El Sol brilla luminoso - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El Sol brilla luminoso (2606)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\El Sol brilla luminoso (2606)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Fotosintesis (2608)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fotosintesis (2608)",
                    "extension": "jpg"
                },
                {
                    "name": "Fotosintesis   Asimov, Isaac",
                    "fileName": "Fotosintesis - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fotosintesis (2608)",
                    "extension": "epub"
                },
                {
                    "name": "Fotosintesis   Asimov, Isaac",
                    "fileName": "Fotosintesis - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fotosintesis (2608)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fotosintesis (2608)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 1 - Fundacion (2609)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 1 - Fundacion (2609)",
                    "extension": "jpg"
                },
                {
                    "name": "Fundacion 1   Fundacion   Asimov, Isaac",
                    "fileName": "Fundacion 1 - Fundacion - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 1 - Fundacion (2609)",
                    "extension": "epub"
                },
                {
                    "name": "Fundacion 1   Fundacion   Asimov, Isaac",
                    "fileName": "Fundacion 1 - Fundacion - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 1 - Fundacion (2609)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 1 - Fundacion (2609)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 2 - Fundacion e Imperio (2610)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 2 - Fundacion e Imperio (2610)",
                    "extension": "jpg"
                },
                {
                    "name": "Fundacion 2   Fundacion e Imper   Asimov, Isaac",
                    "fileName": "Fundacion 2 - Fundacion e Imper - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 2 - Fundacion e Imperio (2610)",
                    "extension": "epub"
                },
                {
                    "name": "Fundacion 2   Fundacion e Imper   Asimov, Isaac",
                    "fileName": "Fundacion 2 - Fundacion e Imper - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 2 - Fundacion e Imperio (2610)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 2 - Fundacion e Imperio (2610)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 3 - Segunda fundacion (2611)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 3 - Segunda fundacion (2611)",
                    "extension": "jpg"
                },
                {
                    "name": "Fundacion 3   Segunda fundacion   Asimov, Isaac",
                    "fileName": "Fundacion 3 - Segunda fundacion - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 3 - Segunda fundacion (2611)",
                    "extension": "epub"
                },
                {
                    "name": "Fundacion 3   Segunda fundacion   Asimov, Isaac",
                    "fileName": "Fundacion 3 - Segunda fundacion - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 3 - Segunda fundacion (2611)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 3 - Segunda fundacion (2611)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 4 - Los limites de la fun (2612)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 4 - Los limites de la fun (2612)",
                    "extension": "jpg"
                },
                {
                    "name": "Fundacion 4   Los limites de la   Asimov, Isaac",
                    "fileName": "Fundacion 4 - Los limites de la - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 4 - Los limites de la fun (2612)",
                    "extension": "epub"
                },
                {
                    "name": "Fundacion 4   Los limites de la   Asimov, Isaac",
                    "fileName": "Fundacion 4 - Los limites de la - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 4 - Los limites de la fun (2612)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 4 - Los limites de la fun (2612)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 5 - Fundacion y Tierra (2613)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 5 - Fundacion y Tierra (2613)",
                    "extension": "jpg"
                },
                {
                    "name": "Fundacion 5   Fundacion y Tierr   Asimov, Isaac",
                    "fileName": "Fundacion 5 - Fundacion y Tierr - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 5 - Fundacion y Tierra (2613)",
                    "extension": "epub"
                },
                {
                    "name": "Fundacion 5   Fundacion y Tierr   Asimov, Isaac",
                    "fileName": "Fundacion 5 - Fundacion y Tierr - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 5 - Fundacion y Tierra (2613)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 5 - Fundacion y Tierra (2613)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 6 - Preludio A La Fundaci (2614)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 6 - Preludio A La Fundaci (2614)",
                    "extension": "jpg"
                },
                {
                    "name": "Fundacion 6   Preludio A La Fun   Asimov, Isaac",
                    "fileName": "Fundacion 6 - Preludio A La Fun - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 6 - Preludio A La Fundaci (2614)",
                    "extension": "epub"
                },
                {
                    "name": "Fundacion 6   Preludio A La Fun   Asimov, Isaac",
                    "fileName": "Fundacion 6 - Preludio A La Fun - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 6 - Preludio A La Fundaci (2614)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 6 - Preludio A La Fundaci (2614)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 7 - Hacia La Fundacion (2615)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 7 - Hacia La Fundacion (2615)",
                    "extension": "jpg"
                },
                {
                    "name": "Fundacion 7   Hacia La Fundacio   Asimov, Isaac",
                    "fileName": "Fundacion 7 - Hacia La Fundacio - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 7 - Hacia La Fundacion (2615)",
                    "extension": "epub"
                },
                {
                    "name": "Fundacion 7   Hacia La Fundacio   Asimov, Isaac",
                    "fileName": "Fundacion 7 - Hacia La Fundacio - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 7 - Hacia La Fundacion (2615)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Fundacion 7 - Hacia La Fundacion (2615)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Grandes Ideas De La Ciencia (2616)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Grandes Ideas De La Ciencia (2616)",
                    "extension": "jpg"
                },
                {
                    "name": "Grandes Ideas De La Ciencia   Asimov, Isaac",
                    "fileName": "Grandes Ideas De La Ciencia - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Grandes Ideas De La Ciencia (2616)",
                    "extension": "epub"
                },
                {
                    "name": "Grandes Ideas De La Ciencia   Asimov, Isaac",
                    "fileName": "Grandes Ideas De La Ciencia - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Grandes Ideas De La Ciencia (2616)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Grandes Ideas De La Ciencia (2616)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Guia de la Biblia Antiguo Testament (2617)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Guia de la Biblia Antiguo Testament (2617)",
                    "extension": "jpg"
                },
                {
                    "name": "Guia de la Biblia Antiguo Testa   Asimov, Isaac",
                    "fileName": "Guia de la Biblia Antiguo Testa - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Guia de la Biblia Antiguo Testament (2617)",
                    "extension": "epub"
                },
                {
                    "name": "Guia de la Biblia Antiguo Testa   Asimov, Isaac",
                    "fileName": "Guia de la Biblia Antiguo Testa - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Guia de la Biblia Antiguo Testament (2617)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Guia de la Biblia Antiguo Testament (2617)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Guia De La Biblia Nuevo Testamento (2618)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Guia De La Biblia Nuevo Testamento (2618)",
                    "extension": "jpg"
                },
                {
                    "name": "Guia De La Biblia Nuevo Testame   Asimov, Isaac",
                    "fileName": "Guia De La Biblia Nuevo Testame - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Guia De La Biblia Nuevo Testamento (2618)",
                    "extension": "epub"
                },
                {
                    "name": "Guia De La Biblia Nuevo Testame   Asimov, Isaac",
                    "fileName": "Guia De La Biblia Nuevo Testame - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Guia De La Biblia Nuevo Testamento (2618)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Guia De La Biblia Nuevo Testamento (2618)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Historia de los egipcios (2620)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Historia de los egipcios (2620)",
                    "extension": "jpg"
                },
                {
                    "name": "Historia de los egipcios   Asimov, Isaac",
                    "fileName": "Historia de los egipcios - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Historia de los egipcios (2620)",
                    "extension": "epub"
                },
                {
                    "name": "Historia de los egipcios   Asimov, Isaac",
                    "fileName": "Historia de los egipcios - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Historia de los egipcios (2620)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Historia de los egipcios (2620)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Historia universal Asimov_ El Imper (2621)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Historia universal Asimov_ El Imper (2621)",
                    "extension": "jpg"
                },
                {
                    "name": "Historia universal Asimov  El I   Asimov, Isaac",
                    "fileName": "Historia universal Asimov_ El I - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Historia universal Asimov_ El Imper (2621)",
                    "extension": "epub"
                },
                {
                    "name": "Historia universal Asimov  El I   Asimov, Isaac",
                    "fileName": "Historia universal Asimov_ El I - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Historia universal Asimov_ El Imper (2621)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Historia universal Asimov_ El Imper (2621)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Historia universal Asimov_ La Repub (2623)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Historia universal Asimov_ La Repub (2623)",
                    "extension": "jpg"
                },
                {
                    "name": "Historia universal Asimov  La R   Asimov, Isaac",
                    "fileName": "Historia universal Asimov_ La R - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Historia universal Asimov_ La Repub (2623)",
                    "extension": "epub"
                },
                {
                    "name": "Historia universal Asimov  La R   Asimov, Isaac",
                    "fileName": "Historia universal Asimov_ La R - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Historia universal Asimov_ La Repub (2623)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Historia universal Asimov_ La Repub (2623)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Introduccion A La Ciencia (Vol I) (2624)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Introduccion A La Ciencia (Vol I) (2624)",
                    "extension": "jpg"
                },
                {
                    "name": "Introduccion A La Ciencia (Vol    Asimov, Isaac",
                    "fileName": "Introduccion A La Ciencia (Vol  - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Introduccion A La Ciencia (Vol I) (2624)",
                    "extension": "epub"
                },
                {
                    "name": "Introduccion A La Ciencia (Vol    Asimov, Isaac",
                    "fileName": "Introduccion A La Ciencia (Vol  - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Introduccion A La Ciencia (Vol I) (2624)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Introduccion A La Ciencia (Vol I) (2624)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Introduccion A La Ciencia (Vol II) (2628)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Introduccion A La Ciencia (Vol II) (2628)",
                    "extension": "jpg"
                },
                {
                    "name": "Introduccion A La Ciencia (Vol    Asimov, Isaac",
                    "fileName": "Introduccion A La Ciencia (Vol  - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Introduccion A La Ciencia (Vol II) (2628)",
                    "extension": "epub"
                },
                {
                    "name": "Introduccion A La Ciencia (Vol    Asimov, Isaac",
                    "fileName": "Introduccion A La Ciencia (Vol  - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Introduccion A La Ciencia (Vol II) (2628)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Introduccion A La Ciencia (Vol II) (2628)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\La Busqueda de los Elementos (2630)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Busqueda de los Elementos (2630)",
                    "extension": "jpg"
                },
                {
                    "name": "La Busqueda de los Elementos   Asimov, Isaac",
                    "fileName": "La Busqueda de los Elementos - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Busqueda de los Elementos (2630)",
                    "extension": "epub"
                },
                {
                    "name": "La Busqueda de los Elementos   Asimov, Isaac",
                    "fileName": "La Busqueda de los Elementos - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Busqueda de los Elementos (2630)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Busqueda de los Elementos (2630)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\La Edad del Futuro I (2631)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Edad del Futuro I (2631)",
                    "extension": "jpg"
                },
                {
                    "name": "La Edad del Futuro I   Asimov, Isaac",
                    "fileName": "La Edad del Futuro I - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Edad del Futuro I (2631)",
                    "extension": "epub"
                },
                {
                    "name": "La Edad del Futuro I   Asimov, Isaac",
                    "fileName": "La Edad del Futuro I - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Edad del Futuro I (2631)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Edad del Futuro I (2631)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\La Edad del Futuro II (2634)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Edad del Futuro II (2634)",
                    "extension": "jpg"
                },
                {
                    "name": "La Edad del Futuro II   Asimov, Isaac",
                    "fileName": "La Edad del Futuro II - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Edad del Futuro II (2634)",
                    "extension": "epub"
                },
                {
                    "name": "La Edad del Futuro II   Asimov, Isaac",
                    "fileName": "La Edad del Futuro II - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Edad del Futuro II (2634)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Edad del Futuro II (2634)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\La estrella de Belen y otros ensayo (2635)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La estrella de Belen y otros ensayo (2635)",
                    "extension": "jpg"
                },
                {
                    "name": "La estrella de Belen y otros en   Asimov, Isaac",
                    "fileName": "La estrella de Belen y otros en - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La estrella de Belen y otros ensayo (2635)",
                    "extension": "epub"
                },
                {
                    "name": "La estrella de Belen y otros en   Asimov, Isaac",
                    "fileName": "La estrella de Belen y otros en - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La estrella de Belen y otros ensayo (2635)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La estrella de Belen y otros ensayo (2635)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\La Medicion Del Universo (2638)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Medicion Del Universo (2638)",
                    "extension": "jpg"
                },
                {
                    "name": "La Medicion Del Universo   Asimov, Isaac",
                    "fileName": "La Medicion Del Universo - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Medicion Del Universo (2638)",
                    "extension": "epub"
                },
                {
                    "name": "La Medicion Del Universo   Asimov, Isaac",
                    "fileName": "La Medicion Del Universo - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Medicion Del Universo (2638)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Medicion Del Universo (2638)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\La Receta del Tiranosauro (2639)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Receta del Tiranosauro (2639)",
                    "extension": "jpg"
                },
                {
                    "name": "La Receta del Tiranosauro   Asimov, Isaac",
                    "fileName": "La Receta del Tiranosauro - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Receta del Tiranosauro (2639)",
                    "extension": "epub"
                },
                {
                    "name": "La Receta del Tiranosauro   Asimov, Isaac",
                    "fileName": "La Receta del Tiranosauro - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Receta del Tiranosauro (2639)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Receta del Tiranosauro (2639)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\La Receta del Tiranosauro II (2640)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Receta del Tiranosauro II (2640)",
                    "extension": "jpg"
                },
                {
                    "name": "La Receta del Tiranosauro II   Asimov, Isaac",
                    "fileName": "La Receta del Tiranosauro II - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Receta del Tiranosauro II (2640)",
                    "extension": "epub"
                },
                {
                    "name": "La Receta del Tiranosauro II   Asimov, Isaac",
                    "fileName": "La Receta del Tiranosauro II - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Receta del Tiranosauro II (2640)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Receta del Tiranosauro II (2640)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\La Receta del Tiranosauro III (2643)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Receta del Tiranosauro III (2643)",
                    "extension": "jpg"
                },
                {
                    "name": "La Receta del Tiranosauro III   Asimov, Isaac",
                    "fileName": "La Receta del Tiranosauro III - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Receta del Tiranosauro III (2643)",
                    "extension": "epub"
                },
                {
                    "name": "La Receta del Tiranosauro III   Asimov, Isaac",
                    "fileName": "La Receta del Tiranosauro III - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Receta del Tiranosauro III (2643)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Receta del Tiranosauro III (2643)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\La Relatividad Del Error (2644)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Relatividad Del Error (2644)",
                    "extension": "jpg"
                },
                {
                    "name": "La Relatividad Del Error   Asimov, Isaac",
                    "fileName": "La Relatividad Del Error - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Relatividad Del Error (2644)",
                    "extension": "epub"
                },
                {
                    "name": "La Relatividad Del Error   Asimov, Isaac",
                    "fileName": "La Relatividad Del Error - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Relatividad Del Error (2644)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Relatividad Del Error (2644)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\La Tierra de Canaan (2648)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Tierra de Canaan (2648)",
                    "extension": "jpg"
                },
                {
                    "name": "La Tierra de Canaan   Asimov, Isaac",
                    "fileName": "La Tierra de Canaan - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Tierra de Canaan (2648)",
                    "extension": "epub"
                },
                {
                    "name": "La Tierra de Canaan   Asimov, Isaac",
                    "fileName": "La Tierra de Canaan - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Tierra de Canaan (2648)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La Tierra de Canaan (2648)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\La tragedia de la Luna (2650)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La tragedia de la Luna (2650)",
                    "extension": "jpg"
                },
                {
                    "name": "La tragedia de la Luna   Asimov, Isaac",
                    "fileName": "La tragedia de la Luna - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La tragedia de la Luna (2650)",
                    "extension": "epub"
                },
                {
                    "name": "La tragedia de la Luna   Asimov, Isaac",
                    "fileName": "La tragedia de la Luna - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La tragedia de la Luna (2650)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La tragedia de la Luna (2650)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\La ultima pregunta (2652)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La ultima pregunta (2652)",
                    "extension": "jpg"
                },
                {
                    "name": "La ultima pregunta   Asimov, Isaac",
                    "fileName": "La ultima pregunta - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La ultima pregunta (2652)",
                    "extension": "epub"
                },
                {
                    "name": "La ultima pregunta   Asimov, Isaac",
                    "fileName": "La ultima pregunta - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La ultima pregunta (2652)",
                    "extension": "mobi"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\La ultima pregunta (2652)",
                    "extension": "opf"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Momentos estelares de la ciencia (2654)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Momentos estelares de la ciencia (2654)",
                    "extension": "jpg"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Momentos estelares de la ciencia (2654)",
                    "extension": "opf"
                },
                {
                    "name": "Momentos estelares de la cienci   Asimov, Isaac",
                    "fileName": "Momentos estelares de la cienci - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Momentos estelares de la ciencia (2654)",
                    "extension": "epub"
                },
                {
                    "name": "Momentos estelares de la cienci   Asimov, Isaac",
                    "fileName": "Momentos estelares de la cienci - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Momentos estelares de la ciencia (2654)",
                    "extension": "mobi"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Soplo mortal (2656)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Soplo mortal (2656)",
                    "extension": "jpg"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Soplo mortal (2656)",
                    "extension": "opf"
                },
                {
                    "name": "Soplo mortal   Asimov, Isaac",
                    "fileName": "Soplo mortal - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Soplo mortal (2656)",
                    "extension": "epub"
                },
                {
                    "name": "Soplo mortal   Asimov, Isaac",
                    "fileName": "Soplo mortal - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Soplo mortal (2656)",
                    "extension": "mobi"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\Yo, Robot (2657)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Yo, Robot (2657)",
                    "extension": "jpg"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Yo, Robot (2657)",
                    "extension": "opf"
                },
                {
                    "name": "Yo, Robot   Asimov, Isaac",
                    "fileName": "Yo, Robot - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Yo, Robot (2657)",
                    "extension": "epub"
                },
                {
                    "name": "Yo, Robot   Asimov, Isaac",
                    "fileName": "Yo, Robot - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\Yo, Robot (2657)",
                    "extension": "mobi"
                }
            ],
            "Biblioteca de calibre\\Asimov, Isaac\\_Hay Alguien Ahi_ (2658)": [
                {
                    "name": "cover",
                    "fileName": "cover.jpg",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\_Hay Alguien Ahi_ (2658)",
                    "extension": "jpg"
                },
                {
                    "name": "metadata",
                    "fileName": "metadata.opf",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\_Hay Alguien Ahi_ (2658)",
                    "extension": "opf"
                },
                {
                    "name": " Hay Alguien Ahi    Asimov, Isaac",
                    "fileName": "_Hay Alguien Ahi_ - Asimov, Isaac.epub",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\_Hay Alguien Ahi_ (2658)",
                    "extension": "epub"
                },
                {
                    "name": " Hay Alguien Ahi    Asimov, Isaac",
                    "fileName": "_Hay Alguien Ahi_ - Asimov, Isaac.mobi",
                    "folder": "Biblioteca de calibre\\Asimov, Isaac\\_Hay Alguien Ahi_ (2658)",
                    "extension": "mobi"
                }
            ]
        }
    },
    "HD.txt": {
        "connected": "D:",
        "content": {
            "Backup\\Pendiente\\Fundaciones": [
                {
                    "name": "[spa]Isaac AsimovFundación 1Fundación",
                    "fileName": "[spa]Isaac AsimovFundación 1Fundación.epub",
                    "folder": "Backup\\Pendiente\\Fundaciones",
                    "extension": "epub"
                },
                {
                    "name": "[spa]Isaac AsimovFundación 2Fundacion e Imperio",
                    "fileName": "[spa]Isaac AsimovFundación 2Fundacion e Imperio.epub",
                    "folder": "Backup\\Pendiente\\Fundaciones",
                    "extension": "epub"
                },
                {
                    "name": "[spa]Isaac AsimovFundación 3Segunda fundacion",
                    "fileName": "[spa]Isaac AsimovFundación 3Segunda fundacion.epub",
                    "folder": "Backup\\Pendiente\\Fundaciones",
                    "extension": "epub"
                },
                {
                    "name": "[spa]Isaac AsimovFundación 4Los limites de la fundación",
                    "fileName": "[spa]Isaac AsimovFundación 4Los limites de la fundación.epub",
                    "folder": "Backup\\Pendiente\\Fundaciones",
                    "extension": "epub"
                },
                {
                    "name": "[spa]Isaac AsimovFundación 5Fundación y Tierra",
                    "fileName": "[spa]Isaac AsimovFundación 5Fundación y Tierra.epub",
                    "folder": "Backup\\Pendiente\\Fundaciones",
                    "extension": "epub"
                },
                {
                    "name": "[spa]Isaac AsimovFundación 6Preludio A La Fundación",
                    "fileName": "[spa]Isaac AsimovFundación 6Preludio A La Fundación.epub",
                    "folder": "Backup\\Pendiente\\Fundaciones",
                    "extension": "epub"
                },
                {
                    "name": "[spa]Isaac AsimovFundación 7Hacia La Fundación",
                    "fileName": "[spa]Isaac AsimovFundación 7Hacia La Fundación.epub",
                    "folder": "Backup\\Pendiente\\Fundaciones",
                    "extension": "epub"
                },
                {
                    "name": "[spa]Isaac AsimovTrilogía de la fundación",
                    "fileName": "[spa]Isaac AsimovTrilogía de la fundación.epub",
                    "folder": "Backup\\Pendiente\\Fundaciones",
                    "extension": "epub"
                }
            ],
            "Pictures\\IA": [
                {
                    "name": "asimov",
                    "fileName": "asimov.psd",
                    "folder": "Pictures\\IA",
                    "extension": "psd"
                }
            ],
            "Pictures\\Movil\\FOTOS MÓVIL ALE\\Books\\MoonReader": [
                {
                    "name": "Alpha Centauri, la estrella mas proxima   Asimov  Isaac",
                    "fileName": "Alpha Centauri, la estrella mas proxima - Asimov_ Isaac.epub",
                    "folder": "Pictures\\Movil\\FOTOS MÓVIL ALE\\Books\\MoonReader",
                    "extension": "epub"
                },
                {
                    "name": "La Edad del Futuro I   Asimov  Isaac",
                    "fileName": "La Edad del Futuro I - Asimov_ Isaac.epub",
                    "folder": "Pictures\\Movil\\FOTOS MÓVIL ALE\\Books\\MoonReader",
                    "extension": "epub"
                }
            ]
        }
    }
}
*/

export interface IFile {
    name: string;
    fileName: string;
    folder: string;
    extension: string;
}

export interface IFileList {
    [key: string]: IFile[];
}