## Répertoire des classes Tailwind CSS

> Tailwind génère plusieurs milliers de classes utilitaires (y compris les variantes responsive, dark, state, etc.). Cette fiche recense les familles de classes principales avec leur motif, un exemple d’utilisation et le rendu attendu. Référez-vous à la [documentation officielle](https://tailwindcss.com/docs) pour les listes exhaustives et les valeurs personnalisées.

### Couleurs et arrière-plan
| Classe (motif) | Exemple | Résultat |
| --- | --- | --- |
| `text-{color}` | `<p class="text-blue-600">Texte</p>` | Texte bleu #2563EB |
| `bg-{color}` | `<div class="bg-emerald-200">...</div>` | Fond vert clair |
| `from/to/ via-{color}` | `<div class="bg-gradient-to-r from-purple-500 to-pink-500">...</div>` | Dégradé horizontal violet → rose |
| `border-{color}` | `<button class="border border-red-400">...</button>` | Bord rouge |

### Typographie
| Classe | Exemple | Résultat |
| --- | --- | --- |
| `font-sans / font-serif / font-mono` | `<p class="font-serif">...</p>` | Change la famille |
| `text-xs → text-9xl` | `<h1 class="text-4xl">Titre</h1>` | Taille du texte |
| `font-thin → font-black` | `<span class="font-bold">...</span>` | Graisse |
| `tracking-tighter → tracking-widest` | `<p class="tracking-wide">...</p>` | Espacement des lettres |
| `leading-none → leading-loose` | `<p class="leading-relaxed">...</p>` | Interligne |

### Mise en page
| Classe | Exemple | Résultat |
| --- | --- | --- |
| `container` | `<div class="container mx-auto">...</div>` | Largeur max responsive |
| `mx-auto`, `p-4`, `m-6` | `<section class="p-6 m-4">...</section>` | Marges / padding |
| `space-x-4`, `space-y-2` | `<div class="flex space-x-4">...</div>` | Espacement entre enfants |
| `divide-x`, `divide-y` | `<ul class="divide-y divide-gray-200">...</ul>` | Traits séparateurs |

### Flexbox
| Classe | Exemple | Résultat |
| --- | --- | --- |
| `flex`, `inline-flex` | `<div class="flex">...</div>` | Active flexbox |
| `flex-row / flex-col` | `<div class="flex flex-col">...</div>` | Direction |
| `justify-start → justify-between` | `<div class="flex justify-between">...</div>` | Répartition horizontale |
| `items-start → items-center` | `<div class="flex items-center">...</div>` | Alignement vertical |
| `flex-1`, `grow`, `shrink-0` | `<div class="flex-1">...</div>` | Croissance / rétrécissement |

### Grille CSS
| Classe | Exemple | Résultat |
| --- | --- | --- |
| `grid`, `inline-grid` | `<section class="grid">...</section>` | Active CSS Grid |
| `grid-cols-1 → grid-cols-12` | `<div class="grid grid-cols-3">...</div>` | Colonnes fixes |
| `grid-rows-1 → grid-rows-6` | `<div class="grid grid-rows-2">...</div>` | Lignes |
| `gap-2`, `gap-x-4`, `gap-y-8` | `<div class="grid gap-6">...</div>` | Espace entre cellules |
| `col-span-2`, `row-span-3` | `<div class="col-span-2">...</div>` | Fusion de cases |

### Dimensions
| Classe | Exemple | Résultat |
| --- | --- | --- |
| `w-{size}` (`w-1/2`, `w-64`, `w-full`) | `<div class="w-1/2">...</div>` | Largeur |
| `h-{size}` (`h-screen`, `h-10`) | `<div class="h-screen">...</div>` | Hauteur |
| `min-w-0`, `max-w-lg`, `min-h-screen` | `<article class="max-w-2xl">...</article>` | Contraintes |

### Positionnement
| Classe | Exemple | Résultat |
| --- | --- | --- |
| `relative`, `absolute`, `fixed`, `sticky` | `<div class="relative">...</div>` | Contexte de position |
| `top-0`, `right-4`, `-left-2/3` | `<div class="absolute top-2 right-2">...</div>` | Offset |
| `z-0 → z-50`, `z-auto` | `<div class="z-20">...</div>` | Ordre d’empilement |

### Bordures et arrondis
| Classe | Exemple | Résultat |
| --- | --- | --- |
| `border`, `border-2`, `border-y` | `<div class="border border-gray-300">...</div>` | Affiche une bordure |
| `rounded-none → rounded-full`, `rounded-t-lg` | `<img class="rounded-full" />` | Coins arrondis |
| `ring`, `ring-2`, `ring-offset-4` | `<button class="ring-2 ring-indigo-500">...</button>` | Effet halo |

### Effets & filtres
| Classe | Exemple | Résultat |
| --- | --- | --- |
| `shadow-sm → shadow-2xl` | `<div class="shadow-lg">...</div>` | Ombre portée |
| `opacity-0 → opacity-100` | `<div class="opacity-75">...</div>` | Transparence |
| `blur`, `brightness-125`, `grayscale`, `backdrop-blur` | `<div class="backdrop-blur-md">...</div>` | Filtres CSS |

### Transitions et animations
| Classe | Exemple | Résultat |
| --- | --- | --- |
| `transition`, `transition-colors`, `transition-all` | `<button class="transition-colors duration-200 hover:bg-slate-700">Cliquer</button>` | Active transitions |
| `duration-75 → duration-1000` | `<div class="transition duration-500">...</div>` | Durée |
| `ease-linear`, `ease-in-out` | `<div class="transition ease-in-out">...</div>` | Courbe d’aisance |
| `delay-75 → delay-700` | `<div class="transition delay-150">...</div>` | Délai |
| `animate-spin`, `animate-ping`, `animate-bounce`, `animate-pulse` | `<svg class="animate-spin">...</svg>` | Animations prêtes à l’emploi |

### Variantes responsive, état et thème
| Préfixe | Exemple | Résultat |
| --- | --- | --- |
| `sm:`, `md:`, `lg:`, `xl:`, `2xl:` | `<div class="sm:text-base lg:text-3xl">...</div>` | Breakpoints |
| `hover:`, `focus:`, `active:`, `visited:` | `<a class="text-blue-500 hover:text-blue-700">Lien</a>` | États interactifs |
| `dark:` | `<div class="dark:bg-gray-900 dark:text-white">...</div>` | Mode sombre |
| `motion-safe:`, `portrait:`, `print:` | `<div class="print:hidden">...</div>` | Préférences/Media queries |

### Helpers divers
| Classe | Exemple | Résultat |
| --- | --- | --- |
| `sr-only`, `not-sr-only` | `<span class="sr-only">Texte caché</span>` | Accessibilité |
| `cursor-pointer`, `cursor-wait` | `<button class="cursor-not-allowed">...</button>` | Curseur |
| `select-none`, `select-all` | `<p class="select-all">...</p>` | Sélection texte |
| `pointer-events-none`, `pointer-events-auto` | `<div class="pointer-events-none">...</div>` | Événements souris |

### Comment utiliser ce guide
1. Combinez les classes utilitaires directement sur vos balises HTML.
2. Composez des variantes (`md:hover:bg-slate-800`) pour les contextes complexes.
3. Ajoutez vos tokens (couleurs, spacing) dans `tailwind.config.js` pour élargir l’éventail de classes.
4. Utilisez `@apply` dans vos fichiers CSS si vous devez factoriser un ensemble de classes récurrent.

> Astuce : exécutez `npx tailwindcss -i ./input.css -o ./output.css --watch` pendant le dev pour bénéficier du JIT, qui génère uniquement les classes réellement utilisées dans votre code.
