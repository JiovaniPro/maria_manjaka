// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import type { ReactElement } from "react";
// import { useToast } from "@/components/ToastContainer";
// import { LoadingScreen } from "@/components/LoadingScreen";
// import { useLoading } from "@/hooks/useLoading";

// type Transaction = {
//   id: string;
//   date: string;
//   description: string;
//   montant: number;
//   montantAffiche?: string;
//   type: "Revenu" | "Dépense";
//   categorie: string;
//   compte: string;
// };

// type Category = {
//   id: string;
//   nom: string;
//   type: "Revenu" | "Dépense";
//   statut: "actif" | "inactif";
// };

// type NavItem = { label: string; icon: () => ReactElement; href: string };
// type PreferenceItem = { label: string; icon: () => ReactElement };
// type SortField = "date" | "montant" | "description";
// type SortOrder = "asc" | "desc" | null;

// const navItems: NavItem[] = [
//   { label: "Dashboard", icon: DashboardIcon, href: "/dashboard" },
//   { label: "Transactions", icon: TransactionsIcon, href: "/transaction" },
//   { label: "Comptes", icon: AccountsIcon, href: "/comptes" },
//   { label: "Catégories", icon: CategoriesIcon, href: "/categorie" },
//   { label: "Rapports", icon: ReportsIcon, href: "/rapports" },
//   { label: "Transaction Bancaire", icon: UsersIcon, href: "/banque" },
// ];

// const preferenceItems: PreferenceItem[] = [
//   { label: "Paramètres", icon: SettingsIcon },
//   { label: "Aide", icon: HelpIcon },
// ];

// // Variables pour API - Transactions
// const transactionsData: Transaction[] = [
//   { id: "1", date: "2024-10-18", description: "Offrande Culte", montant: 1350, montantAffiche: "+1.350€", type: "Revenu", categorie: "Offrandes Cultes", compte: "Caisse" },
//   { id: "2", date: "2024-10-18", description: "Description", montant: -300, montantAffiche: "-300€", type: "Dépense", categorie: "Matériel", compte: "Caisse" },
//   { id: "3", date: "2024-10-18", description: "Offrande Culte", montant: 1350, montantAffiche: "+1.350€", type: "Revenu", categorie: "Offrandes Cultes", compte: "Caisse" },
//   { id: "4", date: "2024-10-18", description: "Achat Fournitures", montant: -1120, montantAffiche: "-1120€", type: "Dépense", categorie: "Dîme", compte: "Banque A" },
//   { id: "5", date: "2024-10-17", description: "Achat Fournitures", montant: -120, montantAffiche: "-120€", type: "Dépense", categorie: "Dîme", compte: "Banque A" },
//   { id: "6", date: "2024-10-17", description: "Dîme J. Dupont", montant: 250, montantAffiche: "+250€", type: "Revenu", categorie: "Dîme", compte: "Caisse" },
//   { id: "7", date: "2024-10-18", description: "Location Salle", montant: 250, montantAffiche: "+250€", type: "Revenu", categorie: "Matériel", compte: "Banque A" },
//   { id: "8", date: "2024-10-18", description: "Description", montant: 250, montantAffiche: "+250€", type: "Revenu", categorie: "Dîme", compte: "Caisse" },
// ];

// // Variables pour API - Catégories
// const categoriesData: Category[] = [
//   { id: "1", nom: "Dîme", type: "Revenu", statut: "actif" },
//   { id: "2", nom: "Offrandes Cultes", type: "Revenu", statut: "actif" },
//   { id: "3", nom: "Vente de Livres", type: "Revenu", statut: "inactif" },
//   { id: "4", nom: "Dons", type: "Revenu", statut: "actif" },
//   { id: "5", nom: "Location de Salles", type: "Revenu", statut: "actif" },
//   { id: "10", nom: "Loyer", type: "Dépense", statut: "actif" },
//   { id: "11", nom: "Salaires", type: "Dépense", statut: "actif" },
//   { id: "12", nom: "Électricité", type: "Dépense", statut: "actif" },
//   { id: "13", nom: "Entretien", type: "Dépense", statut: "actif" },
//   { id: "14", nom: "Matériel", type: "Dépense", statut: "actif" },
// ];

// export default function TransactionsPage() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const { showToast } = useToast();
//   const isLoading = useLoading(1200);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterCompte, setFilterCompte] = useState("");
//   const [filterCategorie, setFilterCategorie] = useState("");
//   const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sortField, setSortField] = useState<SortField | null>(null);
//   const [sortOrder, setSortOrder] = useState<SortOrder>(null);
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [formData, setFormData] = useState({
//     date: "",
//     description: "",
//     montant: "",
//     type: "Revenu" as "Revenu" | "Dépense",
//     categorie: "",
//     compte: "",
//   });
//   const itemsPerPage = 8;

//   const handleSort = (field: SortField) => {
//     if (sortField === field) {
//       if (sortOrder === null) {
//         setSortOrder("asc");
//       } else if (sortOrder === "asc") {
//         setSortOrder("desc");
//       } else {
//         setSortOrder(null);
//         setSortField(null);
//       }
//     } else {
//       setSortField(field);
//       setSortOrder("asc");
//     }
//   };

//   const getSortedTransactions = () => {
//     let sorted = [...transactionsData];

//     if (sortField && sortOrder) {
//       sorted.sort((a, b) => {
//         let aValue: any;
//         let bValue: any;

//         if (sortField === "date") {
//           aValue = new Date(a.date).getTime();
//           bValue = new Date(b.date).getTime();
//         } else if (sortField === "montant") {
//           aValue = a.montant;
//           bValue = b.montant;
//         } else if (sortField === "description") {
//           aValue = a.description.toLowerCase();
//           bValue = b.description.toLowerCase();
//         }

//         if (sortOrder === "asc") {
//           return aValue > bValue ? 1 : -1;
//         } else {
//           return aValue < bValue ? 1 : -1;
//         }
//       });
//     }

//     return sorted;
//   };

//   const filteredTransactions = getSortedTransactions().filter((t) => {
//     const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchCompte = filterCompte === "" || t.compte === filterCompte;
//     const matchCategorie = filterCategorie === "" || t.categorie === filterCategorie;
//     return matchSearch && matchCompte && matchCategorie;
//   });

//   const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

//   const availableCategories = categoriesData.filter(
//     (cat) => cat.type === formData.type && cat.statut === "actif"
//   );

//   const handleLogout = () => {
//     showToast("Déconnexion réussie", "success");
//     setTimeout(() => {
//       router.push("/connexion");
//     }, 1000);
//   };

//   const handleModify = () => {
//     if (selectedTransactions.length === 0) {
//       showToast("Veuillez sélectionner au moins une transaction", "warning");
//     } else {
//       showToast(`${selectedTransactions.length} transaction(s) modifiée(s) avec succès`, "success");
//       setSelectedTransactions([]);
//     }
//   };

//   const handleDelete = () => {
//     if (selectedTransactions.length === 0) {
//       showToast("Veuillez sélectionner au moins une transaction", "warning");
//     } else {
//       showToast(`${selectedTransactions.length} transaction(s) supprimée(s)`, "error");
//       setSelectedTransactions([]);
//     }
//   };

//   const handleAddTransaction = (e: React.FormEvent) => {
//     e.preventDefault();
//     showToast("Transaction ajoutée avec succès", "success");
//     setIsAddModalOpen(false);
//     setFormData({
//       date: "",
//       description: "",
//       montant: "",
//       type: "Revenu",
//       categorie: "",
//       compte: "",
//     });
//   };

//   const toggleTransaction = (id: string) => {
//     setSelectedTransactions((prev) =>
//       prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
//     );
//   };

//   const toggleAll = () => {
//     if (selectedTransactions.length === paginatedTransactions.length && paginatedTransactions.length > 0) {
//       setSelectedTransactions([]);
//     } else {
//       setSelectedTransactions(paginatedTransactions.map((t) => t.id));
//     }
//   };

//   if (isLoading) {
//     return <LoadingScreen />;
//   }

//   return (
//     <div className="flex min-h-screen bg-zinc-50 font-sans text-black">
//       <aside className="sticky top-0 flex h-screen w-72 flex-col justify-between bg-black px-6 py-8 text-white">
//         <div className="space-y-8">
//           <div className="flex items-center gap-3">
//             <IconChurch />
//             <div className="text-sm font-semibold uppercase tracking-[0.3em]">
//               MARIA MANJAKA
//             </div>
//           </div>
//           <nav className="space-y-6">
//             <p className="text-xs uppercase tracking-[0.4em] text-white/50">Menu</p>
//             <ul className="space-y-2">
//               {navItems.map(({ label, icon: Icon, href }) => {
//                 const isActive = pathname === href;
//                 return (
//                   <li key={label}>
//                     <Link
//                       href={href}
//                       className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm transition ${
//                         isActive
//                           ? "bg-white text-black"
//                           : "text-white/70 hover:bg-white/10"
//                       }`}
//                     >
//                       <Icon />
//                       <span>{label}</span>
//                     </Link>
//                   </li>
//                 );
//               })}
//             </ul>
//           </nav>
//         </div>
//         <div className="space-y-4 border-t border-white/10 pt-6">
//           <p className="text-xs uppercase tracking-[0.4em] text-white/50">
//             Préférences
//           </p>
//           <ul className="space-y-2">
//             {preferenceItems.map(({ label, icon: Icon }) => (
//               <li key={label}>
//                 <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm text-white/70 transition hover:bg-white/10">
//                   <Icon />
//                   <span>{label}</span>
//                 </button>
//               </li>
//             ))}
//           </ul>
//           <button 
//             onClick={handleLogout}
//             className="flex w-full items-center gap-3 rounded-2xl border border-white/20 px-3 py-2 text-sm text-white transition hover:bg-white hover:text-black"
//           >
//             <LogoutIcon />
//             <span>Déconnexion</span>
//           </button>
//         </div>
//       </aside>

//       <main className="min-h-screen flex-1 overflow-y-auto px-10 py-10">
//         <header className="mb-8">
//           <h1 className="text-3xl font-bold">Transactions</h1>
//           <p className="mt-2 text-sm text-black/60">
//             Gérez et suivez toutes vos transactions financières
//           </p>
//         </header>

//         {/* Barre de recherche et filtres */}
//         <div className="mb-6 rounded-3xl border border-black/5 bg-white p-6 shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
//           <div className="mb-4 flex flex-wrap items-center gap-4">
//             <div className="flex flex-1 items-center gap-3 rounded-full border border-black/10 bg-zinc-50 px-4 py-2.5">
//               <SearchIcon />
//               <input
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="flex-1 bg-transparent text-sm outline-none placeholder:text-black/40"
//                 placeholder="Filtrer par description..."
//               />
//             </div>
//             <button 
//               onClick={() => setIsAddModalOpen(true)}
//               className="flex items-center gap-2 rounded-full border border-blue-500 bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
//             >
//               <PlusIcon />
//               <span>Ajouter une Transaction</span>
//             </button>
//           </div>

//           <div className="flex flex-wrap items-center gap-3">
//             <div className="flex items-center gap-2 rounded-full border border-black/10 bg-zinc-50 px-4 py-2">
//               <MenuIcon />
//               <select
//                 value={filterCompte}
//                 onChange={(e) => setFilterCompte(e.target.value)}
//                 className="bg-transparent text-sm outline-none"
//               >
//                 <option value="">Compte</option>
//                 <option value="Caisse">Caisse</option>
//                 <option value="Banque A">Banque A</option>
//               </select>
//             </div>
//             <div className="flex items-center gap-2 rounded-full border border-black/10 bg-zinc-50 px-4 py-2">
//               <TagIcon />
//               <select
//                 value={filterCategorie}
//                 onChange={(e) => setFilterCategorie(e.target.value)}
//                 className="bg-transparent text-sm outline-none"
//               >
//                 <option value="">Catégorie</option>
//                 {categoriesData.map((cat) => (
//                   <option key={cat.id} value={cat.nom}>{cat.nom}</option>
//                 ))}
//               </select>
//             </div>
//             <button className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-black/60 transition hover:bg-black/5">
//               <StarIcon />
//               <span>Transactions</span>
//             </button>
//           </div>
//         </div>

//         {/* Tableau des transactions */}
//         <div className="rounded-3xl border border-black/5 bg-white shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
//           <div className="border-b border-black/5 p-6">
//             <div className="flex items-center justify-between">
//               <h2 className="text-lg font-semibold">Liste des Transactions</h2>
//               <div className="flex items-center gap-2">
//                 <span className="text-sm text-black/60">
//                   {selectedTransactions.length > 0 && `${selectedTransactions.length} sélectionnée(s)`}
//                 </span>
//               </div>
//             </div>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="border-b border-black/5 bg-zinc-50">
//                 <tr>
//                   <th className="px-6 py-4 text-left">
//                     <input
//                       type="checkbox"
//                       checked={selectedTransactions.length === paginatedTransactions.length && paginatedTransactions.length > 0}
//                       onChange={toggleAll}
//                       className="h-4 w-4 rounded border-black/20 text-blue-500 focus:ring-2 focus:ring-blue-500"
//                     />
//                   </th>
//                   <th className="px-6 py-4 text-left">
//                     <button
//                       onClick={() => handleSort("date")}
//                       className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-black/60 transition hover:text-black"
//                     >
//                       Date
//                       <SortIcon field="date" currentField={sortField} order={sortOrder} />
//                     </button>
//                   </th>
//                   <th className="px-6 py-4 text-left">
//                     <button
//                       onClick={() => handleSort("description")}
//                       className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-black/60 transition hover:text-black"
//                     >
//                       Description
//                       <SortIcon field="description" currentField={sortField} order={sortOrder} />
//                     </button>
//                   </th>
//                   <th className="px-6 py-4 text-left">
//                     <button
//                       onClick={() => handleSort("montant")}
//                       className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-black/60 transition hover:text-black"
//                     >
//                       Montant
//                       <SortIcon field="montant" currentField={sortField} order={sortOrder} />
//                     </button>
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-black/60">
//                     Type
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-black/60">
//                     Catégorie
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-black/60">
//                     Compte
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {paginatedTransactions.map((transaction) => (
//                   <tr
//                     key={transaction.id}
//                     className="border-b border-black/5 transition hover:bg-zinc-50/50"
//                   >
//                     <td className="px-6 py-4">
//                       <input
//                         type="checkbox"
//                         checked={selectedTransactions.includes(transaction.id)}
//                         onChange={() => toggleTransaction(transaction.id)}
//                         className="h-4 w-4 rounded border-black/20 text-blue-500 focus:ring-2 focus:ring-blue-500"
//                       />
//                     </td>
//                     <td className="px-6 py-4 text-sm text-black/60">
//                       {new Date(transaction.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
//                     </td>
//                     <td className="px-6 py-4 text-sm font-medium">{transaction.description}</td>
//                     <td className="px-6 py-4">
//                       <span
//                         className={`text-sm font-semibold ${
//                           transaction.montant > 0 ? "text-emerald-600" : "text-red-600"
//                         }`}
//                       >
//                         {transaction.montantAffiche || transaction.montant}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span
//                         className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
//                           transaction.type === "Revenu" 
//                             ? "bg-emerald-50 text-emerald-700" 
//                             : "bg-red-50 text-red-700"
//                         }`}
//                       >
//                         {transaction.type === "Revenu" ? (
//                           <ArrowUpIcon />
//                         ) : (
//                           <ArrowDownIcon />
//                         )}
//                         {transaction.type}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-black/60">{transaction.categorie}</td>
//                     <td className="px-6 py-4 text-sm text-black/60">{transaction.compte}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Actions et pagination */}
//         <div className="mt-6 rounded-3xl border border-black/5 bg-white p-6 shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
//           <div className="flex flex-wrap items-center justify-between gap-4">
//             <div className="flex items-center gap-3">
//               <span className="text-sm font-semibold text-black/70">Actions :</span>
//               <button 
//                 onClick={handleModify}
//                 className="flex items-center gap-2 rounded-2xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
//                 disabled={selectedTransactions.length === 0}
//               >
//                 <EditIcon />
//                 <span>Modifier</span>
//               </button>
//               <button 
//                 onClick={handleDelete}
//                 className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
//                 disabled={selectedTransactions.length === 0}
//               >
//                 <TrashIcon />
//                 <span>Supprimer</span>
//               </button>
//             </div>
//             <div className="flex items-center gap-3">
//               <button className="rounded-xl border border-black/10 p-2.5 transition hover:bg-black/5">
//                 <GridIcon />
//               </button>
//               <button className="rounded-xl border border-black/10 p-2.5 transition hover:bg-black/5">
//                 <ListIcon />
//               </button>
//               <div className="mx-2 h-6 w-px bg-black/10" />
//               <button
//                 onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                 disabled={currentPage === 1}
//                 className="rounded-xl border border-black/10 p-2.5 text-black/60 transition hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent"
//               >
//                 <ChevronLeftIcon />
//               </button>
//               <span className="min-w-[80px] text-center text-sm font-medium text-black/70">
//                 Page {currentPage} / {totalPages}
//               </span>
//               <button
//                 onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//                 disabled={currentPage === totalPages}
//                 className="rounded-xl border border-black/10 p-2.5 text-black/60 transition hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent"
//               >
//                 <ChevronRightIcon />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Modal d'ajout de transaction */}
//         {isAddModalOpen && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//             <div className="w-full max-w-lg rounded-3xl border border-black/10 bg-white p-8 shadow-2xl">
//               <div className="mb-6 flex items-center justify-between">
//                 <h2 className="text-xl font-bold">Nouvelle Transaction</h2>
//                 <button
//                   onClick={() => setIsAddModalOpen(false)}
//                   className="rounded-lg p-2 text-black/40 transition hover:bg-black/5 hover:text-black"
//                 >
//                   <CloseIcon />
//                 </button>
//               </div>
//               <form onSubmit={handleAddTransaction} className="space-y-5">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="mb-2 block text-sm font-semibold text-black">
//                       Date
//                     </label>
//                     <input
//                       type="date"
//                       value={formData.date}
//                       onChange={(e) => setFormData({ ...formData, date: e.target.value })}
//                       required
//                       className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/20"
//                     />
//                   </div>
//                   <div>
//                     <label className="mb-2 block text-sm font-semibold text-black">
//                       Montant (€)
//                     </label>
//                     <input
//                       type="number"
//                       step="0.01"
//                       value={formData.montant}
//                       onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
//                       required
//                       className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/20"
//                       placeholder="0.00"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="mb-2 block text-sm font-semibold text-black">
//                     Description
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.description}
//                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                     required
//                     className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/20"
//                     placeholder="Entrer une description"
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="mb-2 block text-sm font-semibold text-black">
//                       Type
//                     </label>
//                     <select
//                       value={formData.type}
//                       onChange={(e) => setFormData({ ...formData, type: e.target.value as "Revenu" | "Dépense", categorie: "" })}
//                       required
//                       className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/20"
//                     >
//                       <option value="Revenu">Revenu</option>
//                       <option value="Dépense">Dépense</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="mb-2 block text-sm font-semibold text-black">
//                       Catégorie
//                     </label>
//                     <select
//                       value={formData.categorie}
//                       onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
//                       required
//                       className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/20"
//                     >
//                       <option value="">Sélectionner</option>
//                       {availableCategories.map((cat) => (
//                         <option key={cat.id} value={cat.nom}>{cat.nom}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="mb-2 block text-sm font-semibold text-black">
//                     Compte
//                   </label>
//                   <select
//                     value={formData.compte}
//                     onChange={(e) => setFormData({ ...formData, compte: e.target.value })}
//                     required
//                     className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/20"
//                   >
//                     <option value="">Sélectionner un compte</option>
//                     <option value="Caisse">Caisse</option>
//                     <option value="Banque A">Banque A</option>
//                     <option value="Banque B">Banque B</option>
//                   </select>
//                 </div>

//                 <div className="flex gap-4 pt-4">
//                   <button
//                     type="submit"
//                     className="flex-1 rounded-2xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
//                   >
//                     Enregistrer
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setIsAddModalOpen(false)}
//                     className="flex-1 rounded-2xl border border-black/20 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-black/5"
//                   >
//                     Annuler
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>);
// }
// // Composant pour l'icône de tri
// function SortIcon({ field, currentField, order }: { field: SortField; currentField: SortField | null; order: SortOrder }) {
// if (currentField !== field || order === null) {
// return (
// <svg viewBox="0 0 24 24" className="h-4 w-4 text-black/30" fill="currentColor">
// <path d="M12 5l-7 7h14l-7-7zm0 14l7-7H5l7 7z" />
// </svg>
// );
// }
// if (order === "asc") {
// return (
// <svg viewBox="0 0 24 24" className="h-4 w-4 text-black" fill="currentColor">
// <path d="M12 5l-7 7h14l-7-7z" />
// </svg>
// );
// }
// return (
// <svg viewBox="0 0 24 24" className="h-4 w-4 text-black" fill="currentColor">
// <path d="M12 19l7-7H5l7 7z" />
// </svg>
// );
// }
// // Icons (tous identiques aux fichiers précédents)
// function DashboardIcon() {
// return (
// <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
// <path d="M4 3h7v9H4zM13 3h7v5h-7zM13 10h7v11h-7zM4 14h7v7H4z" />
// </svg>
// );
// }
// function TransactionsIcon() {
// return (
// <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
// <path d="M3 5h18v2H3zM3 11h18v2H3zM3 17h18v2H3z" />
// </svg>
// );
// }
// function AccountsIcon() {
// return (
// <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
// <path d="M4 4h16v6H4zM4 14h16v6H4z" />
// </svg>
// );
// }
// function CategoriesIcon() {
// return (
// <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
// <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />
// </svg>
// );
// }
// function ReportsIcon() {
// return (
// <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
// <path d="M5 3h4l2 3h8v15H5z" />
// </svg>
// );
// }
// function UsersIcon() {
// return (
// <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
// <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9v-1a5 5 0 015-5h4a5 5 0 015 5v1z" />
// </svg>
// );
// }
// function SettingsIcon() {
// return (
// <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
// <path d="M12 15a3 3 0 110-6 3 3 0 010 6zm8.6-3.5l1.4 2.5-2.1 3.6-2.9-.3a7.1 7.1 0 01-1.6 1l-.5 2.8H9.1l-.5-2.8a7.1 7.1 0 01-1.6-1l-2.9.3-2.1-3.6 1.4-2.5a7.6 7.6 0 010-1l-1.4-2.5L4.1 4.4l2.9.3a7.1 7.1 0 011.6-1L9.1 1h5.8l.5 2.8a7.1 7.1 0 011.6 1l2.9-.3 2.1 3.6-1.4 2.5a7.6 7.6 0 010 1z" />
// </svg>
// );
// }
// function HelpIcon() {
// return (
// <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
// <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 15h-1v-2h2v2zm1.1-4.4l-.6.4V14h-1v-2l1-.7a1.6 1.6 0 10-2.5-1.3H8.9A3.1 3.1 0 1113.1 12z" />
// </svg>
// );
// }
// function LogoutIcon() {
// return (
// <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
// <path d="M10 3h10v18H10v-2h8V5h-8zm-1 6l-4 3 4 3v-2h7v-2H9z" />
// </svg>
// );
// }
// function IconChurch() {
// return (
// <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
// <path d="M12 2v6m-4-2 4-4 4 4M5 22v-7l7-5 7 5v7z" strokeLinecap="round" />
// </svg>
// );
// }
// function SearchIcon() {
// return (
// <svg viewBox="0 0 24 24" className="h-5 w-5 text-black/40" fill="currentColor">
// <path d="M15.5 14h-.8l-.3-.3a6 6 0 10-.7.7l.3.3v.8L20 21.5 21.5 20zm-5.5 0a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
// </svg>
// );
// }
// function StarIcon() {
// return (
// <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
// <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
// </svg>
// );
// }
// function MenuIcon() {
// return (
// <svg viewBox="0 0 24 24" className="h-4 w-4 text-black/60" fill="currentColor">
// <path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" />
// </svg>
// );
// }
// function TagIcon() {
// return (
// <svg viewBox="0 0 24 24" className="h-4 w-4 text-black/60" fill="none" stroke="currentColor" strokeWidth="2">
// <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
// <circle cx="7" cy="7" r="1" fill="currentColor" />
// </svg>
// );
// }
// function PlusIcon() {
// return (
// <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
// <path d="M12 5v14m-7-7h14" strokeLinecap="round" />
// </svg>
// );
// }
// function EditIcon() {
// return (
// <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
// <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
// <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
// </svg>
// );
// }
// function TrashIcon() {
// return (
// <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
// <path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
// </svg>
// );
// }
// function GridIcon() {
// return (
// <svg viewBox="0 0 24 24" className="h-5 w-5 text-black/60" fill="currentColor">
// <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />
// </svg>
// );
// }
// function ListIcon() {
// return (
// <svg viewBox="0 0 24 24" className="h-5 w-5 text-black/60" fill="currentColor">
// <path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" />
// </svg>
// );
// }
// function ChevronLeftIcon() {
// return (
// <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
// <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
// </svg>
// );
// }
// function ChevronRightIcon() {
// return (
// <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
// <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
// </svg>
// );
// }
// function ArrowUpIcon() {
// return (
// <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
// <path d="M12 19V5m0 0l-7 7m7-7l7 7" strokeLinecap="round" strokeLinejoin="round" />
// </svg>
// );
// }
// function ArrowDownIcon() {
// return (
// <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
// <path d="M12 5v14m0 0l7-7m-7 7l-7-7" strokeLinecap="round" strokeLinejoin="round" />
// </svg>
// );
// }
// function CloseIcon() {
// return (
// <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
// <path d="M18 6L6 18M6 6l12 12" />
// </svg>
// );
// }

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useToast } from "@/components/ToastContainer";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useLoading } from "@/hooks/useLoading";

type Transaction = {
  id: string;
  date: string;
  description: string;
  montant: number;
  montantAffiche?: string;
  type: "Revenu" | "Dépense";
  categorie: string;
  compte: string;
};

type Category = {
  id: string;
  nom: string;
  type: "Revenu" | "Dépense";
  statut: "actif" | "inactif";
};

type NavItem = { label: string; icon: () => ReactElement; href: string };
type PreferenceItem = { label: string; icon: () => ReactElement };
type SortField = "date" | "montant" | "description";
type SortOrder = "asc" | "desc" | null;

// ====================================================================
// ICON COMPONENTS (Placeholders pour rendre le code exécutable)
// ====================================================================

function DashboardIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18M18 15V6L12 9L7 4" /></svg>;
}
function TransactionsIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
}
function AccountsIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0 8a4 4 0 0 0 0-8z" /></svg>;
}
function CategoriesIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7l7 7" /></svg>;
}
function ReportsIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l18 18M17 17v3h3M17 7h3V4M7 17H4V7" /></svg>;
}
function UsersIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0 8a4 4 0 0 0 0-8z" /></svg>;
}
function SettingsIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4V2M12 22v-2M4 12H2M22 12h-2M18.5 5.5l-1.4 1.4M6.9 17.1l-1.4 1.4M18.5 18.5l-1.4-1.4M6.9 6.9l-1.4-1.4" /></svg>;
}
function HelpIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c.5 1 1 2 1 3M12 17h.01" /></svg>;
}
function IconChurch() {
  return <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z" /></svg>;
}
function LogoutIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v18h-6M10 17l5-5l-5-5M15 12H3" /></svg>;
}
function SearchIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5 text-black/40" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>;
}
function PlusIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>;
}
function CalendarIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5 text-black/60" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
}
function FilterIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5 text-black/60" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l10 10V18l4 2v-7l10-10" /></svg>;
}
function MenuIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5 text-black/60" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>;
}
function TagIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5 text-black/60" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7l7 7" /></svg>;
}
function CalculatorIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M8 6h8M8 10h8M8 14h8M8 18h4" /></svg>;
}
function ArrowUpIcon() {
  return <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7l7 7" /></svg>;
}
function ArrowDownIcon() {
  return <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M19 12l-7 7l-7-7" /></svg>;
}
function EditIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>;
}
function TrashIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" /></svg>;
}
function CloseIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>;
}

// Composant pour afficher l'icône de tri
function SortIcon({ field, currentField, order }: { field: SortField; currentField: SortField | null; order: SortOrder }) {
  if (currentField !== field) {
    return <svg viewBox="0 0 24 24" className="h-3 w-3 text-black/30" fill="currentColor"><path d="M12 5l6 6H6l6-6zM12 19l-6-6h12l-6 6z" /></svg>; // Up/Down (Unsorted)
  }
  if (order === "asc") {
    return <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor"><path d="M12 5l6 6H6z" /></svg>; // Up (Ascending)
  }
  if (order === "desc") {
    return <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor"><path d="M12 19l-6-6h12z" /></svg>; // Down (Descending)
  }
  return null;
}

// Les icônes GridIcon, ListIcon, ChevronLeftIcon, ChevronRightIcon étaient déjà présentes dans le snippet mais je les ai ajoutées
// ici par souci de complétude.

// Variables pour API - Soldes des comptes
const soldeCaisse = 500; // Solde actuel de la caisse
const soldeBanque = 10000; // Solde actuel de la banque

// Variables pour API - Transactions (Déjà fournies)
const transactionsData: Transaction[] = [
  { id: "1", date: "2024-10-18", description: "Offrande Culte", montant: 1350, montantAffiche: "+1.350€", type: "Revenu", categorie: "Offrandes Cultes", compte: "Caisse" },
  { id: "2", date: "2024-10-18", description: "Description", montant: -300, montantAffiche: "-300€", type: "Dépense", categorie: "Matériel", compte: "Caisse" },
  { id: "3", date: "2024-11-15", description: "Offrande Culte", montant: 1350, montantAffiche: "+1.350€", type: "Revenu", categorie: "Offrandes Cultes", compte: "Caisse" },
  { id: "4", date: "2024-11-18", description: "Achat Fournitures", montant: -1120, montantAffiche: "-1120€", type: "Dépense", categorie: "Dîme", compte: "Banque A" },
  { id: "5", date: "2024-09-17", description: "Achat Fournitures", montant: -120, montantAffiche: "-120€", type: "Dépense", categorie: "Dîme", compte: "Banque A" },
  { id: "6", date: "2024-09-17", description: "Dîme J. Dupont", montant: 250, montantAffiche: "+250€", type: "Revenu", categorie: "Dîme", compte: "Caisse" },
  { id: "7", date: "2024-11-18", description: "Location Salle", montant: 250, montantAffiche: "+250€", type: "Revenu", categorie: "Matériel", compte: "Banque A" },
  { id: "8", date: "2024-12-05", description: "Description", montant: 250, montantAffiche: "+250€", type: "Revenu", categorie: "Dîme", compte: "Caisse" },
];

// Variables pour API - Catégories (Déjà fournies)
const categoriesData: Category[] = [
  { id: "1", nom: "Dîme", type: "Revenu", statut: "actif" },
  { id: "2", nom: "Offrandes Cultes", type: "Revenu", statut: "actif" },
  { id: "3", nom: "Vente de Livres", type: "Revenu", statut: "inactif" },
  { id: "4", nom: "Dons", type: "Revenu", statut: "actif" },
  { id: "5", nom: "Location de Salles", type: "Revenu", statut: "actif" },
  { id: "10", nom: "Loyer", type: "Dépense", statut: "actif" },
  { id: "11", nom: "Salaires", type: "Dépense", statut: "actif" },
  { id: "12", nom: "Électricité", type: "Dépense", statut: "actif" },
  { id: "13", nom: "Entretien", type: "Dépense", statut: "actif" },
  { id: "14", nom: "Matériel", type: "Dépense", statut: "actif" },
];

const navItems: NavItem[] = [
  { label: "Dashboard", icon: DashboardIcon, href: "/dashboard" },
  { label: "Transactions", icon: TransactionsIcon, href: "/transaction" },
  { label: "Comptes", icon: AccountsIcon, href: "/comptes" },
  { label: "Catégories", icon: CategoriesIcon, href: "/categorie" },
  { label: "Rapports", icon: ReportsIcon, href: "/rapports" },
  { label: "Transaction Bancaire", icon: UsersIcon, href: "/banque" },
];

const preferenceItems: PreferenceItem[] = [
  { label: "Paramètres", icon: SettingsIcon },
  { label: "Aide", icon: HelpIcon },
];

const months = [
  { value: "", label: "Tous les mois" },
  { value: "01", label: "Janvier" },
  { value: "02", label: "Février" },
  { value: "03", label: "Mars" },
  { value: "04", label: "Avril" },
  { value: "05", label: "Mai" },
  { value: "06", label: "Juin" },
  { value: "07", label: "Juillet" },
  { value: "08", label: "Août" },
  { value: "09", label: "Septembre" },
  { value: "10", label: "Octobre" },
  { value: "11", label: "Novembre" },
  { value: "12", label: "Décembre" },
];

const years = ["", "2024", "2023", "2022", "2021"];

export default function TransactionsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const isLoading = useLoading(1200);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompte, setFilterCompte] = useState("");
  const [filterCategorie, setFilterCategorie] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterType, setFilterType] = useState<"" | "Revenu" | "Dépense">("");
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().substring(0, 10), // Set default date to today
    description: "",
    montant: "",
    type: "Revenu" as "Revenu" | "Dépense",
    categorie: "",
    compte: "",
    numeroCheque: "",
  });
  const itemsPerPage = 8;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === null) {
        setSortOrder("asc");
      } else if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortOrder(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getSortedTransactions = () => {
    let sorted = [...transactionsData];

    if (sortField && sortOrder) {
      sorted.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortField === "date") {
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
        } else if (sortField === "montant") {
          aValue = a.montant;
          bValue = b.montant;
        } else if (sortField === "description") {
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
        }

        if (sortOrder === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return sorted;
  };

  const filteredTransactions = useMemo(() => {
    return getSortedTransactions().filter((t) => {
      const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCompte = filterCompte === "" || t.compte === filterCompte;
      const matchCategorie = filterCategorie === "" || t.categorie === filterCategorie;
      const matchType = filterType === "" || t.type === filterType;

      const transactionDate = new Date(t.date);
      const matchMonth = filterMonth === "" || transactionDate.getMonth() + 1 === parseInt(filterMonth);
      const matchYear = filterYear === "" || transactionDate.getFullYear() === parseInt(filterYear);

      return matchSearch && matchCompte && matchCategorie && matchType && matchMonth && matchYear;
    });
  }, [searchTerm, filterCompte, filterCategorie, filterType, filterMonth, filterYear, sortField, sortOrder]);

  const totalMontant = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.montant, 0);
  }, [filteredTransactions]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const availableCategories = categoriesData.filter(
    (cat) => cat.type === formData.type && cat.statut === "actif"
  );

  const montantNumber = parseFloat(formData.montant) || 0;
  const isCaisseDisabled = formData.type === "Dépense" && montantNumber > soldeCaisse;
  const showNumeroCheque = formData.type === "Dépense" && formData.compte === "Banque A";

  const handleLogout = () => {
    showToast("Déconnexion réussie", "success");
    setTimeout(() => {
      router.push("/connexion");
    }, 1000);
  };

  const handleModify = () => {
    if (selectedTransactions.length === 0) {
      showToast("Veuillez sélectionner au moins une transaction", "warning");
    } else {
      showToast(`${selectedTransactions.length} transaction(s) modifiée(s) avec succès`, "success");
      setSelectedTransactions([]);
    }
  };

  const handleDelete = () => {
    if (selectedTransactions.length === 0) {
      showToast("Veuillez sélectionner au moins une transaction", "warning");
    } else {
      showToast(`${selectedTransactions.length} transaction(s) supprimée(s)`, "error");
      setSelectedTransactions([]);
    }
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();

    if (showNumeroCheque && !formData.numeroCheque) {
      showToast("Le numéro de chèque est obligatoire pour un paiement par banque", "warning");
      return;
    }

    // Validation simple pour le montant
    if (montantNumber <= 0) {
      showToast("Le montant doit être supérieur à zéro", "warning");
      return;
    }

    // Logique d'ajout (simulée ici)
    const newTransaction: Transaction = {
      id: (transactionsData.length + 1).toString(),
      date: formData.date,
      description: formData.description,
      montant: formData.type === "Revenu" ? montantNumber : -montantNumber, // Signe correct
      montantAffiche: formData.type === "Revenu" ? `+${montantNumber}€` : `-${montantNumber}€`,
      type: formData.type,
      categorie: formData.categorie,
      compte: formData.compte,
      // Le numéro de chèque ne fait pas partie du type Transaction, mais il serait stocké séparément dans un vrai backend.
    };

    // Simuler l'ajout
    transactionsData.push(newTransaction);

    showToast("Transaction ajoutée avec succès", "success");
    setIsAddModalOpen(false);
    setFormData({
      date: new Date().toISOString().substring(0, 10),
      description: "",
      montant: "",
      type: "Revenu",
      categorie: "",
      compte: "",
      numeroCheque: "",
    });
  };

  const toggleTransaction = (id: string) => {
    setSelectedTransactions((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedTransactions.length === paginatedTransactions.length && paginatedTransactions.length > 0) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(paginatedTransactions.map((t) => t.id));
    }
  };

  const handleTypeChange = (newType: "Revenu" | "Dépense") => {
    setFormData({
      ...formData,
      type: newType,
      categorie: "", // Reset categorie on type change
      compte: "", // Reset compte on type change
      numeroCheque: "",
    });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-black">
      <aside className="sticky top-0 flex h-screen w-72 flex-col justify-between bg-black px-6 py-8 text-white">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <IconChurch />
            <div className="text-sm font-semibold uppercase tracking-[0.3em]">
              MARIA MANJAKA
            </div>
          </div>
          <nav className="space-y-6">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Menu</p>
            <ul className="space-y-2">
              {navItems.map(({ label, icon: Icon, href }) => {
                const isActive = pathname === href;
                return (
                  <li key={label}>
                    <Link
                      href={href}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm transition ${
                        isActive
                          ? "bg-white text-black"
                          : "text-white/70 hover:bg-white/10"
                      }`}
                    >
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        <div className="space-y-4 border-t border-white/10 pt-6">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Préférences
          </p>
          <ul className="space-y-2">
            {preferenceItems.map(({ label, icon: Icon }) => (
              <li key={label}>
                <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm text-white/70 transition hover:bg-white/10">
                  <Icon />
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl border border-white/20 px-3 py-2 text-sm text-white transition hover:bg-white hover:text-black"
          >
            <LogoutIcon />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="min-h-screen flex-1 overflow-y-auto px-10 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="mt-2 text-sm text-black/60">
            Gérez et suivez toutes vos transactions financières
          </p>
        </header>

        {/* Barre de recherche et filtres */}
        <div className="mb-6 rounded-3xl border border-black/5 bg-white p-6 shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div className="flex flex-1 items-center gap-3 rounded-full border border-black/10 bg-zinc-50 px-4 py-2.5">
              <SearchIcon />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-black/40"
                placeholder="Filtrer par description..."
              />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 rounded-full border border-blue-500 bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              <PlusIcon />
              <span>Ajouter une Transaction</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-zinc-50 px-4 py-2">
              <CalendarIcon />
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-transparent text-sm outline-none"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-zinc-50 px-4 py-2">
              <CalendarIcon />
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="bg-transparent text-sm outline-none"
              >
                <option value="">Toutes les années</option>
                {years.slice(1).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-zinc-50 px-4 py-2">
              <FilterIcon />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as "" | "Revenu" | "Dépense")}
                className="bg-transparent text-sm outline-none"
              >
                <option value="">Tous les types</option>
                <option value="Revenu">Recettes</option>
                <option value="Dépense">Dépenses</option>
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-zinc-50 px-4 py-2">
              <MenuIcon />
              <select
                value={filterCompte}
                onChange={(e) => setFilterCompte(e.target.value)}
                className="bg-transparent text-sm outline-none"
              >
                <option value="">Tous les comptes</option>
                <option value="Caisse">Caisse</option>
                <option value="Banque A">Banque A</option>
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-zinc-50 px-4 py-2">
              <TagIcon />
              <select
                value={filterCategorie}
                onChange={(e) => setFilterCategorie(e.target.value)}
                className="bg-transparent text-sm outline-none"
              >
                <option value="">Toutes les catégories</option>
                {categoriesData.map((cat) => (
                  <option key={cat.id} value={cat.nom}>{cat.nom}</option>
                ))}
              </select>
            </div>

            <div className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 font-semibold ${
              totalMontant >= 0
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-red-500 bg-red-50 text-red-700"
            }`}>
              <CalculatorIcon />
              <span className="text-sm">
                Total: {totalMontant >= 0 ? '+' : ''}{totalMontant.toFixed(2)}€
              </span>
            </div>
          </div>
        </div>

        {/* Tableau des transactions */}
        <div className="rounded-3xl border border-black/5 bg-white shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
          <div className="border-b border-black/5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Liste des Transactions</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-black/60">
                  {filteredTransactions.length} transaction(s)
                  {selectedTransactions.length > 0 && ` · ${selectedTransactions.length} sélectionnée(s)`}
                </span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-black/5 bg-zinc-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-black/20 text-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("date")}
                      className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-black/60 transition hover:text-black"
                    >
                      Date
                      <SortIcon field="date" currentField={sortField} order={sortOrder} />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("description")}
                      className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-black/60 transition hover:text-black"
                    >
                      Description
                      <SortIcon field="description" currentField={sortField} order={sortOrder} />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("montant")}
                      className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-black/60 transition hover:text-black"
                    >
                      Montant
                      <SortIcon field="montant" currentField={sortField} order={sortOrder} />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-black/60">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-black/60">
                    Catégorie
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-black/60">
                    Compte
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-black/5 transition hover:bg-zinc-50/50"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(transaction.id)}
                        onChange={() => toggleTransaction(transaction.id)}
                        className="h-4 w-4 rounded border-black/20 text-blue-500 focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-black/60">
                      {new Date(transaction.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{transaction.description}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-semibold ${
                          transaction.montant > 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {transaction.montantAffiche || transaction.montant}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          transaction.type === "Revenu"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {transaction.type === "Revenu" ? (
                          <ArrowUpIcon />
                        ) : (
                          <ArrowDownIcon />
                        )}
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-black/60">{transaction.categorie}</td>
                    <td className="px-6 py-4 text-sm text-black/60">{transaction.compte}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions et pagination */}
        <div className="mt-6 rounded-3xl border border-black/5 bg-white p-6 shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-black/70">Actions :</span>
              <button
                onClick={handleModify}
                className="flex items-center gap-2 rounded-2xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
                disabled={selectedTransactions.length === 0}
              >
                <EditIcon />
                <span>Modifier</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                disabled={selectedTransactions.length === 0}
              >
                <TrashIcon />
                <span>Supprimer</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button className="rounded-xl border border-black/10 p-2.5 transition hover:bg-black/5">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-black/60" fill="currentColor"><path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" /></svg>
              </button>
              <button className="rounded-xl border border-black/10 p-2.5 transition hover:bg-black/5">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-black/60" fill="currentColor"><path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" /></svg>
              </button>
              <div className="mx-2 h-6 w-px bg-black/10" />
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-xl border border-black/10 p-2.5 text-black/60 transition hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <span className="min-w-[80px] text-center text-sm font-medium text-black/70">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-xl border border-black/10 p-2.5 text-black/60 transition hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Modal d'ajout de transaction */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-3xl border border-black/10 bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">Nouvelle Transaction</h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg p-2 text-black/40 transition hover:bg-black/5 hover:text-black"
                >
                  <CloseIcon />
                </button>
              </div>
              <form onSubmit={handleAddTransaction} className="space-y-5">
                {/* Type de Transaction (Recette/Dépense) */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-black">
                    Type de Transaction
                  </label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => handleTypeChange("Revenu")}
                      className={`flex-1 rounded-xl border-2 px-4 py-3 text-center text-sm font-semibold transition ${
                        formData.type === "Revenu"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-black/10 bg-zinc-50 text-black/70 hover:bg-zinc-100"
                      }`}
                    >
                      Recette (Revenu)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange("Dépense")}
                      className={`flex-1 rounded-xl border-2 px-4 py-3 text-center text-sm font-semibold transition ${
                        formData.type === "Dépense"
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-black/10 bg-zinc-50 text-black/70 hover:bg-zinc-100"
                      }`}
                    >
                      Dépense
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Date */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-black">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Montant */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-black">
                      Montant (€)
                    </label>
                    <input
                      type="number"
                      name="montant"
                      value={formData.montant}
                      onChange={handleInputChange}
                      min="0.01"
                      step="0.01"
                      required
                      className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-black">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Ex: Achat de fournitures, Offrande du mois..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Catégorie */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-black">
                      Catégorie
                    </label>
                    <select
                      name="categorie"
                      value={formData.categorie}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="" disabled>Sélectionner une catégorie</option>
                      {availableCategories.map((cat) => (
                        <option key={cat.id} value={cat.nom}>
                          {cat.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Compte (avec logique de désactivation Caisse) */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-black">
                      {formData.type === "Dépense" ? "Compte à Débiter" : "Compte de Réception"}
                    </label>
                    <select
                      name="compte"
                      value={formData.compte}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-xl border border-black/10 bg-zinc-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="" disabled>Sélectionner un compte</option>
                      <option
                        value="Caisse"
                        disabled={isCaisseDisabled}
                        title={isCaisseDisabled ? `Solde Caisse actuel: ${soldeCaisse}€, montant trop élevé` : `Solde actuel: ${soldeCaisse}€`}
                        className={isCaisseDisabled ? "text-red-500" : ""}
                      >
                        Caisse {isCaisseDisabled ? `(Solde insuffisant: ${soldeCaisse}€)` : `(${soldeCaisse}€)`}
                      </option>
                      <option value="Banque A">
                        Banque A ({soldeBanque}€)
                      </option>
                    </select>
                  </div>
                </div>

                {/* Numéro de Chèque (conditionnel) */}
                {showNumeroCheque && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-black">
                      Numéro de Chèque <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="numeroCheque"
                      value={formData.numeroCheque}
                      onChange={handleInputChange}
                      required={showNumeroCheque}
                      className="w-full rounded-xl border border-red-500 bg-red-50 p-3 text-sm placeholder:text-red-300 focus:border-red-500 focus:ring-red-500"
                      placeholder="Obligatoire pour un paiement par Banque A"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="rounded-2xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="rounded-2xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                  >
                    Ajouter la Transaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
