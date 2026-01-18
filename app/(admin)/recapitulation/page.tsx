"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ToastContainer";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useLoading } from "@/hooks/useLoading";
import api from "@/services/api";
import { CalendarIcon, ReportsIcon } from "@/components/Icons";
import jsPDF from "jspdf";

type Transaction = {
  id: number;
  dateTransaction: string;
  description: string | null;
  montant: number;
  type: "RECETTE" | "DEPENSE";
  compte: string;
};

type SousCategorie = {
  id: number;
  nom: string;
  transactions: Transaction[];
  totalRecettes: number;
  totalDepenses: number;
};

type Categorie = {
  id: number;
  nom: string;
  type: "RECETTE" | "DEPENSE";
  sousCategories: SousCategorie[];
  totalRecettes: number;
  totalDepenses: number;
  soldeNet: number;
};

type RecapitulationData = {
  dateDebut: string;
  dateFin: string;
  categories: Categorie[];
  totalGeneralRecettes: number;
  totalGeneralDepenses: number;
  soldeNetGeneral: number;
};

export default function RecapitulationPage() {
  const { showToast } = useToast();
  const isLoading = useLoading(800);
  const [loadingData, setLoadingData] = useState(false);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [data, setData] = useState<RecapitulationData | null>(null);

  // Initialiser les dates par défaut (mois en cours)
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setDateDebut(firstDay.toISOString().split("T")[0]);
    setDateFin(lastDay.toISOString().split("T")[0]);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-MG", {
      style: "currency",
      currency: "MGA",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const fetchRecapitulation = async () => {
    if (!dateDebut || !dateFin) {
      showToast("Veuillez sélectionner les deux dates", "warning");
      return;
    }

    if (new Date(dateDebut) > new Date(dateFin)) {
      showToast("La date de début doit être antérieure à la date de fin", "error");
      return;
    }

    try {
      setLoadingData(true);
      const response = await api.get(
        `/transactions/recapitulation?dateDebut=${dateDebut}&dateFin=${dateFin}`
      );
      setData(response.data.data);
    } catch (error: any) {
      console.error("Erreur récupération récapitulation:", error);
      showToast(
        error?.response?.data?.message || "Erreur lors de la récupération des données",
        "error"
      );
    } finally {
      setLoadingData(false);
    }
  };

  const generatePDF = () => {
    if (!data) {
      showToast("Aucune donnée à exporter", "warning");
      return;
    }

    try {
      showToast("Génération du PDF en cours...", "info");

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;
      const lineHeight = 5;
      const cellPadding = 2;

      // Fonction pour ajouter une nouvelle page si nécessaire
      const checkPageBreak = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Fonction pour formater le montant avec espaces (format français)
      const formatAmountPDF = (amount: number) => {
        // Utiliser le format français avec espaces comme séparateur de milliers
        return amount
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      };

      // En-tête
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Récapitulation des Transactions", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += lineHeight + 3;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `Période: du ${formatDate(data.dateDebut)} au ${formatDate(data.dateFin)}`,
        pageWidth / 2,
        yPosition,
        { align: "center" }
      );
      yPosition += lineHeight + 4;

      // Filtrer recettes et dépenses
      const categoriesRecettes = data.categories.filter((cat) => cat.type === "RECETTE");
      const categoriesDepenses = data.categories.filter((cat) => cat.type === "DEPENSE");

      if (categoriesRecettes.length === 0 && categoriesDepenses.length === 0) {
        pdf.setFontSize(12);
        pdf.text("Aucune transaction pour cette période", margin, yPosition);
        pdf.save(`Recapitulation_${dateDebut}_${dateFin}.pdf`);
        showToast("PDF généré avec succès", "success");
        return;
      }

      // Colonnes (définies une fois pour tout le document)
      const colDate = margin + 5;
      const colDescription = colDate + 30;
      const colCompte = colDescription + 60;
      const colMontant = pageWidth - margin - 5;

      // Fonction pour afficher l'en-tête du tableau
      const drawTableHeader = () => {
        checkPageBreak(10);
        const headerY = yPosition;
        
        // Fond gris pour l'en-tête
        pdf.setFillColor(245, 245, 245);
        pdf.rect(margin, headerY - lineHeight, maxWidth, lineHeight + 2, "F");
        
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.text("Date", colDate, headerY);
        pdf.text("Description", colDescription, headerY);
        pdf.text("Compte", colCompte, headerY);
        pdf.text("Montant", colMontant, headerY, { align: "right" });
        
        yPosition = headerY + lineHeight + 2;
      };

      // ========== SECTION RECETTES ==========
      if (categoriesRecettes.length > 0) {
        // Titre section recettes
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(0, 150, 0);
        pdf.text("RECETTES", margin, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += lineHeight + 2;

        // En-tête du tableau
        drawTableHeader();

        // Parcourir les catégories comme dans l'affichage web
        categoriesRecettes.forEach((categorie) => {
        // En-tête de catégorie (fond gris comme dans le web)
        checkPageBreak(10);
        pdf.setFillColor(245, 245, 245);
        pdf.rect(margin, yPosition - lineHeight, maxWidth, lineHeight + 5, "F");
        
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text(categorie.nom, margin + 5, yPosition + 1);
        
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 100, 100);
        pdf.text("Recette", margin + 5, yPosition + 4);
        pdf.setTextColor(0, 0, 0);
        
        // Total catégorie à droite
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text("Total Catégorie", pageWidth - margin - 50, yPosition + 1);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(0, 150, 0);
        pdf.text(formatAmountPDF(categorie.totalRecettes), pageWidth - margin - 5, yPosition + 1, {
          align: "right",
        });
        pdf.setTextColor(0, 0, 0);
        
        yPosition += lineHeight + 6;

        // Sous-catégories
        categorie.sousCategories.forEach((sousCategorie) => {
          const transactionsRecettes = sousCategorie.transactions.filter(
            (t) => t.type === "RECETTE"
          );

          if (transactionsRecettes.length > 0) {
            // En-tête de sous-catégorie (fond blanc comme dans le web)
            checkPageBreak(8);
            pdf.setFillColor(255, 255, 255);
            pdf.rect(margin, yPosition - lineHeight, maxWidth, lineHeight + 4, "F");
            
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(10);
            pdf.text(sousCategorie.nom, margin + 5, yPosition + 1);
            
            // Total sous-catégorie à droite
            pdf.setFontSize(7);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(100, 100, 100);
            pdf.text("Total Sous-catégorie", pageWidth - margin - 50, yPosition);
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(0, 150, 0);
            pdf.text(formatAmountPDF(sousCategorie.totalRecettes), pageWidth - margin - 5, yPosition, {
              align: "right",
            });
            pdf.setTextColor(0, 0, 0);
            
            yPosition += lineHeight + 3;

            // Transactions (sans en-tête, déjà en haut)
            if (transactionsRecettes.length > 0) {
              transactionsRecettes.forEach((transaction) => {
                checkPageBreak(6);
                
                pdf.setTextColor(70, 70, 70);
                pdf.text(formatDate(transaction.dateTransaction), colDate, yPosition);
                
                pdf.setTextColor(50, 50, 50);
                pdf.text((transaction.description || "-").substring(0, 40), colDescription, yPosition);
                
                pdf.setTextColor(100, 100, 100);
                pdf.text(transaction.compte.substring(0, 20), colCompte, yPosition);
                
                pdf.setFont("helvetica", "bold");
                pdf.setTextColor(0, 150, 0);
                pdf.text(`+${formatAmountPDF(transaction.montant)} Ar`, colMontant, yPosition, {
                  align: "right",
                });
                pdf.setTextColor(0, 0, 0);
                pdf.setFont("helvetica", "normal");
                
                yPosition += lineHeight + 1;
              });
              
              yPosition += lineHeight;
            }
          }
        });

        yPosition += lineHeight + 2;
      });
      }

      // ========== SECTION DÉPENSES ==========
      if (categoriesDepenses.length > 0) {
        // Espace avant la section dépenses
        checkPageBreak(10);
        yPosition += lineHeight + 3;

        // Titre section dépenses
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(200, 0, 0);
        pdf.text("DÉPENSES", margin, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += lineHeight + 2;

        // En-tête du tableau
        drawTableHeader();

        // Parcourir les catégories de dépenses
        categoriesDepenses.forEach((categorie) => {
          // En-tête de catégorie (fond gris comme dans le web)
          checkPageBreak(10);
          pdf.setFillColor(245, 245, 245);
          pdf.rect(margin, yPosition - lineHeight, maxWidth, lineHeight + 5, "F");
          
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.text(categorie.nom, margin + 5, yPosition + 1);
          
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(100, 100, 100);
          pdf.text("Dépense", margin + 5, yPosition + 4);
          pdf.setTextColor(0, 0, 0);
          
          // Total catégorie à droite
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.text("Total Catégorie", pageWidth - margin - 50, yPosition + 1);
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(200, 0, 0);
          pdf.text(formatAmountPDF(categorie.totalDepenses), pageWidth - margin - 5, yPosition + 1, {
            align: "right",
          });
          pdf.setTextColor(0, 0, 0);
          
          yPosition += lineHeight + 6;

          // Sous-catégories
          categorie.sousCategories.forEach((sousCategorie) => {
            const transactionsDepenses = sousCategorie.transactions.filter(
              (t) => t.type === "DEPENSE"
            );

            if (transactionsDepenses.length > 0) {
              // En-tête de sous-catégorie (fond blanc comme dans le web)
              checkPageBreak(8);
              pdf.setFillColor(255, 255, 255);
              pdf.rect(margin, yPosition - lineHeight, maxWidth, lineHeight + 4, "F");
              
              pdf.setFont("helvetica", "bold");
              pdf.setFontSize(10);
              pdf.text(sousCategorie.nom, margin + 5, yPosition + 1);
              
              // Total sous-catégorie à droite
              pdf.setFontSize(7);
              pdf.setFont("helvetica", "normal");
              pdf.setTextColor(100, 100, 100);
              pdf.text("Total Sous-catégorie", pageWidth - margin - 50, yPosition);
              pdf.setFontSize(9);
              pdf.setFont("helvetica", "bold");
              pdf.setTextColor(200, 0, 0);
              pdf.text(formatAmountPDF(sousCategorie.totalDepenses), pageWidth - margin - 5, yPosition, {
                align: "right",
              });
              pdf.setTextColor(0, 0, 0);
              
              yPosition += lineHeight + 3;

              // Transactions (sans en-tête, déjà en haut)
              if (transactionsDepenses.length > 0) {
                transactionsDepenses.forEach((transaction) => {
                  checkPageBreak(6);
                  
                  pdf.setTextColor(70, 70, 70);
                  pdf.text(formatDate(transaction.dateTransaction), colDate, yPosition);
                  
                  pdf.setTextColor(50, 50, 50);
                  pdf.text((transaction.description || "-").substring(0, 40), colDescription, yPosition);
                  
                  pdf.setTextColor(100, 100, 100);
                  pdf.text(transaction.compte.substring(0, 20), colCompte, yPosition);
                  
                  pdf.setFont("helvetica", "bold");
                  pdf.setTextColor(200, 0, 0);
                  pdf.text(`-${formatAmountPDF(transaction.montant)} Ar`, colMontant, yPosition, {
                    align: "right",
                  });
                  pdf.setTextColor(0, 0, 0);
                  pdf.setFont("helvetica", "normal");
                  
                  yPosition += lineHeight + 1;
                });
                
                yPosition += lineHeight;
              }
            }
          });

          yPosition += lineHeight + 2;
        });
      }

      // Carte récapitulative en bas
      checkPageBreak(20);
      yPosition += lineHeight + 3;

      // Fond pour la carte
      const cardHeight = lineHeight * 4 + 8;
      pdf.setFillColor(250, 250, 250);
      pdf.rect(margin, yPosition, maxWidth, cardHeight, "F");

      // Bordure de la carte
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.rect(margin, yPosition, maxWidth, cardHeight, "S");

      // Titre de la carte
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text("RÉSUMÉ GÉNÉRAL", margin + 5, yPosition + lineHeight + 2);

      yPosition += lineHeight + 5;

      // Total Recettes
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text("Total Recettes:", margin + 10, yPosition);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 150, 0);
      pdf.text(`${formatAmountPDF(data.totalGeneralRecettes)} Ar`, pageWidth - margin - 10, yPosition, {
        align: "right",
      });

      yPosition += lineHeight + 2;

      // Total Dépenses
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text("Total Dépenses:", margin + 10, yPosition);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(200, 0, 0);
      pdf.text(`${formatAmountPDF(data.totalGeneralDepenses)} Ar`, pageWidth - margin - 10, yPosition, {
        align: "right",
      });

      yPosition += lineHeight + 3;

      // Ligne de séparation
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(margin + 5, yPosition, pageWidth - margin - 5, yPosition);

      yPosition += lineHeight + 2;

      // Solde Net (argent qui reste)
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text("Solde Net:", margin + 10, yPosition);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      const soldeColor = data.soldeNetGeneral >= 0 ? [0, 150, 0] : [200, 0, 0];
      pdf.setTextColor(soldeColor[0], soldeColor[1], soldeColor[2]);
      pdf.text(`${formatAmountPDF(data.soldeNetGeneral)} Ar`, pageWidth - margin - 10, yPosition, {
        align: "right",
      });

      yPosition += lineHeight + 6;

      // Pied de page (comme dans le web)
      checkPageBreak(8);
      yPosition += 3;
      
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `Généré le ${new Date().toLocaleDateString("fr-FR")}`,
        pageWidth / 2,
        yPosition,
        { align: "center" }
      );
      yPosition += lineHeight;
      pdf.text(
        "Maria Manjaka - Système de Gestion Financière",
        pageWidth / 2,
        yPosition,
        { align: "center" }
      );

      // Pied de page
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(
          `Page ${i} sur ${totalPages}`,
          pageWidth - margin,
          pageHeight - 10,
          { align: "right" }
        );
        pdf.text(
          `Généré le ${new Date().toLocaleDateString("fr-FR")} - Maria Manjaka`,
          margin,
          pageHeight - 10
        );
      }

      // Générer le nom du fichier avec les dates
      const fileName = `Recapitulation_${dateDebut}_${dateFin}.pdf`;
      pdf.save(fileName);
      showToast("PDF généré avec succès", "success");
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      showToast("Erreur lors de la génération du PDF", "error");
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Récapitulation des Transactions</h1>
        <p className="mt-2 text-sm text-black/60">
          Consultez et exportez la récapitulation des transactions par catégorie et sous-catégorie
        </p>
      </header>

      {/* Sélection des dates */}
      <div className="mb-6 rounded-3xl border border-black/5 bg-white p-6 shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-black/10 bg-zinc-50 px-4 py-2">
            <CalendarIcon />
            <label className="text-sm font-medium text-black/70">Date de début:</label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="cursor-pointer bg-transparent text-sm outline-none"
            />
          </div>

          <div className="flex items-center gap-2 rounded-full border border-black/10 bg-zinc-50 px-4 py-2">
            <CalendarIcon />
            <label className="text-sm font-medium text-black/70">Date de fin:</label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="cursor-pointer bg-transparent text-sm outline-none"
            />
          </div>

          <button
            onClick={fetchRecapitulation}
            disabled={loadingData}
            className="flex items-center gap-2 rounded-full border border-blue-500 bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
          >
            <ReportsIcon />
            <span>{loadingData ? "Chargement..." : "Générer la récapitulation"}</span>
          </button>

          {data && (
            <button
              onClick={generatePDF}
              className="flex items-center gap-2 rounded-full border border-emerald-500 bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              <span>Exporter en PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Affichage de la récapitulation */}
      {data && (
        <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
          {/* En-tête */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-black">Récapitulation des Transactions</h2>
            <p className="mt-2 text-sm text-black/60">
              Période: du {formatDate(data.dateDebut)} au {formatDate(data.dateFin)}
            </p>
          </div>

          {/* Résumé général */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <p className="text-sm font-medium text-emerald-700">Total Recettes</p>
              <p className="mt-2 text-2xl font-bold text-emerald-800">
                {formatCurrency(data.totalGeneralRecettes)}
              </p>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <p className="text-sm font-medium text-red-700">Total Dépenses</p>
              <p className="mt-2 text-2xl font-bold text-red-800">
                {formatCurrency(data.totalGeneralDepenses)}
              </p>
            </div>
            <div
              className={`rounded-2xl border p-6 ${
                data.soldeNetGeneral >= 0
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  data.soldeNetGeneral >= 0 ? "text-emerald-700" : "text-red-700"
                }`}
              >
                Solde Net
              </p>
              <p
                className={`mt-2 text-2xl font-bold ${
                  data.soldeNetGeneral >= 0 ? "text-emerald-800" : "text-red-800"
                }`}
              >
                {formatCurrency(data.soldeNetGeneral)}
              </p>
            </div>
          </div>

          {/* Détails par catégorie */}
          <div className="space-y-6">
            {data.categories.map((categorie) => (
              <div
                key={categorie.id}
                className="rounded-2xl border border-black/10 bg-zinc-50 p-6"
              >
                {/* En-tête de catégorie */}
                <div className="mb-4 flex items-center justify-between border-b border-black/10 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-black">{categorie.nom}</h3>
                    <p className="text-xs text-black/50">
                      {categorie.type === "RECETTE" ? "Recette" : "Dépense"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-black/60">Total Catégorie</p>
                    <p
                      className={`text-lg font-bold ${
                        categorie.soldeNet >= 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(categorie.soldeNet)}
                    </p>
                    <p className="text-xs text-black/40">
                      Recettes: {formatCurrency(categorie.totalRecettes)} | Dépenses:{" "}
                      {formatCurrency(categorie.totalDepenses)}
                    </p>
                  </div>
                </div>

                {/* Sous-catégories */}
                <div className="space-y-4">
                  {categorie.sousCategories.map((sousCategorie) => (
                    <div
                      key={sousCategorie.id}
                      className="rounded-xl border border-black/5 bg-white p-4"
                    >
                      {/* En-tête de sous-catégorie */}
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="font-semibold text-black">{sousCategorie.nom}</h4>
                        <div className="text-right">
                          <p className="text-xs text-black/50">Total Sous-catégorie</p>
                          <p
                            className={`text-sm font-bold ${
                              sousCategorie.totalRecettes - sousCategorie.totalDepenses >= 0
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatCurrency(
                              sousCategorie.totalRecettes - sousCategorie.totalDepenses
                            )}
                          </p>
                          <p className="text-xs text-black/40">
                            Recettes: {formatCurrency(sousCategorie.totalRecettes)} | Dépenses:{" "}
                            {formatCurrency(sousCategorie.totalDepenses)}
                          </p>
                        </div>
                      </div>

                      {/* Liste des transactions */}
                      {sousCategorie.transactions.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-zinc-100 text-black/60">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-semibold">Date</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold">
                                  Description
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-semibold">Compte</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold">
                                  Montant
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5">
                              {sousCategorie.transactions.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-zinc-50">
                                  <td className="px-3 py-2 text-black/70">
                                    {formatDate(transaction.dateTransaction)}
                                  </td>
                                  <td className="px-3 py-2 text-black/80">
                                    {transaction.description || "-"}
                                  </td>
                                  <td className="px-3 py-2 text-black/60">{transaction.compte}</td>
                                  <td
                                    className={`px-3 py-2 text-right font-medium ${
                                      transaction.type === "RECETTE"
                                        ? "text-emerald-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {transaction.type === "RECETTE" ? "+" : "-"}
                                    {formatCurrency(transaction.montant)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pied de page */}
          <div className="mt-8 border-t border-black/10 pt-4 text-center text-xs text-black/40">
            <p>Généré le {new Date().toLocaleDateString("fr-FR")}</p>
            <p className="mt-1">Maria Manjaka - Système de Gestion Financière</p>
          </div>
        </div>
      )}

      {!data && !loadingData && (
        <div className="rounded-3xl border border-black/5 bg-white p-12 text-center">
          <ReportsIcon />
          <p className="mt-4 text-black/60">
            Sélectionnez une période et cliquez sur "Générer la récapitulation" pour afficher les
            données
          </p>
        </div>
      )}
    </div>
  );
}
