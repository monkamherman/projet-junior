"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePaymentReceiptPdf = generatePaymentReceiptPdf;
const pdfkit_1 = __importDefault(require("pdfkit"));
async function generatePaymentReceiptPdf(paiement) {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({ size: "A4", margin: 50 });
        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);
        doc
            .fontSize(20)
            .fillColor("#1d4ed8")
            .text("CENTIC - Reçu de paiement", { align: "center" })
            .moveDown();
        doc
            .fontSize(12)
            .fillColor("#000000")
            .text(`Référence : ${paiement.reference}`)
            .text(`Date : ${new Date(paiement.datePaiement).toLocaleString("fr-FR")}`)
            .moveDown();
        doc
            .fontSize(14)
            .text("Informations de l'apprenant", { underline: true })
            .moveDown(0.5);
        doc
            .fontSize(12)
            .text(`Nom : ${paiement.utilisateur.prenom} ${paiement.utilisateur.nom}`)
            .text(`Email : ${paiement.utilisateur.email}`)
            .text(`Téléphone : ${paiement.utilisateur.telephone ?? "Non renseigné"}`)
            .moveDown();
        doc.fontSize(14).text("Formation", { underline: true }).moveDown(0.5);
        doc
            .fontSize(12)
            .text(`Titre : ${paiement.formation.titre}`)
            .text(`Montant : ${paiement.montant.toLocaleString("fr-FR")} FCFA`)
            .text(`Mode de paiement : ${paiement.mode}`)
            .text(`Statut : ${paiement.statut}`)
            .moveDown();
        doc
            .fontSize(10)
            .fillColor("#555555")
            .text("Merci pour votre confiance. Conservez ce reçu pour toute réclamation.", { align: "center", lineGap: 4 })
            .moveDown(2);
        doc.fontSize(10).text("CENTIC - Centre de formation professionnelle", {
            align: "center",
        });
        doc.end();
    });
}
//# sourceMappingURL=paymentReceipt.service.js.map