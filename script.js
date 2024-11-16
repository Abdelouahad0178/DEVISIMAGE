// Charger les produits depuis le fichier JSON
let produitsJSON = [];

fetch('produits.json')
    .then(response => response.json())
    .then(produits => {
        produitsJSON = produits;
        afficherPalette(produits);
    });

// Afficher la palette des produits
function afficherPalette(produits) {
    const container = document.getElementById('palette-container');
    container.innerHTML = '';
    produits.forEach(produit => {
        const img = document.createElement('img');
        img.src = produit.image;
        img.alt = produit.nom;
        img.onclick = () => ajouterAuDevis(produit.nom, produit.prix, produit.image);
        container.appendChild(img);
    });
}

// Recherche de produits dans la palette
function rechercherProduit() {
    const searchTerm = document.getElementById('search-bar').value.toLowerCase();
    const produitsFiltres = produitsJSON.filter(produit =>
        produit.nom.toLowerCase().includes(searchTerm)
    );
    afficherPalette(produitsFiltres);
}

// Gestion du devis
const devisTableBody = document.querySelector('#devis tbody');
let devis = [];

// Charger le devis depuis LocalStorage
function chargerDevis() {
    const devisStocke = localStorage.getItem('devis');
    if (devisStocke) {
        devis = JSON.parse(devisStocke);
        afficherDevis();
    }
}

// Enregistrer le devis dans LocalStorage
function enregistrerDevis() {
    localStorage.setItem('devis', JSON.stringify(devis));
}

// Ajouter un produit au devis
function ajouterAuDevis(nom, prix, image) {
    const produitExistant = devis.find(item => item.nom === nom);
    if (produitExistant) {
        produitExistant.quantite++;
        produitExistant.total = produitExistant.quantite * produitExistant.prix;
    } else {
        devis.push({ nom, prix, image, quantite: 1, total: prix });
    }
    enregistrerDevis();
    afficherDevis();
}



function afficherDevis() {
    devisTableBody.innerHTML = '';
    let totalGeneral = 0;
    devis.forEach((produit, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${produit.nom}</td>
            <td>
                <input 
                    type="number" 
                    value="${produit.prix}" 
                    min="0" 
                    step="1" 
                    data-index="${index}" 
                    onchange="mettreAJourPrix(this)">
            </td>
            <td>
                <input 
                    type="number" 
                    value="${produit.quantite}" 
                    min="1" 
                    data-index="${index}" 
                    onchange="mettreAJourQuantite(this)">
            </td>
            <td>${produit.total.toFixed(2)} DH</td>
            <td>
                <img 
                    src="${produit.image}" 
                    alt="${produit.nom}" 
                    style="
                        max-width: 120px; /* Limite la largeur */
                        max-height: 120px; /* Limite la hauteur */
                        width: auto; /* Respecte les proportions */
                        height: auto; /* Respecte les proportions */
                        object-fit: contain; /* Ne coupe pas l'image */
                    ">
            </td>
            <td>
                <button onclick="supprimerProduit(${index})">Supprimer</button>
            </td>
        `;
        devisTableBody.appendChild(row);
        totalGeneral += produit.total;
    });
    document.getElementById('total-devis').innerText = `Total: ${totalGeneral.toFixed(2)} DH`;
}


// Mettre à jour le prix d'un produit
function mettreAJourPrix(input) {
    const index = input.getAttribute('data-index');
    const nouveauPrix = parseFloat(input.value);
    if (nouveauPrix >= 0) {
        devis[index].prix = nouveauPrix;
        devis[index].total = devis[index].quantite * nouveauPrix;
        enregistrerDevis();
        afficherDevis();
    } else {
        alert("Le prix doit être supérieur ou égal à 0 !");
        input.value = devis[index].prix; // Restaurer le prix précédent
    }
}

// Mettre à jour la quantité d'un produit
function mettreAJourQuantite(input) {
    const index = input.getAttribute('data-index');
    const nouvelleQuantite = parseInt(input.value, 10);
    if (nouvelleQuantite > 0) {
        devis[index].quantite = nouvelleQuantite;
        devis[index].total = devis[index].prix * nouvelleQuantite;
        enregistrerDevis();
        afficherDevis();
    } else {
        alert("La quantité doit être supérieure à 0 !");
        input.value = devis[index].quantite; // Restaurer la quantité précédente
    }
}

// Supprimer un produit du devis
function supprimerProduit(index) {
    devis.splice(index, 1); // Supprime l'article de la liste
    enregistrerDevis();
    afficherDevis();
}

// Réinitialiser tout le devis
function reinitialiserDevis() {
    if (confirm("Voulez-vous vraiment réinitialiser le devis ?")) {
        devis = [];
        enregistrerDevis();
        afficherDevis();
    }
}

// Exporter le devis en JSON
function exporterDevis() {
    const dataStr = JSON.stringify(devis, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "devis.json";
    a.click();
    URL.revokeObjectURL(url);
}

// Importer un fichier JSON
function importerDevis(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function () {
        devis = JSON.parse(reader.result);
        enregistrerDevis();
        afficherDevis();
    };
    reader.readAsText(file);
}

// Popup d'ajout d'article
function afficherPopupAjout() {
    document.getElementById('popup-ajout').style.display = 'block';
}

function fermerPopupAjout() {
    document.getElementById('popup-ajout').style.display = 'none';
}

function ajouterArticle() {
    const nom = document.getElementById('ajout-nom').value;
    const prix = parseFloat(document.getElementById('ajout-prix').value);
    const quantite = parseInt(document.getElementById('ajout-quantite').value, 10);
    const photo = document.getElementById('ajout-photo').value;

    if (nom && prix > 0 && quantite > 0 && photo) {
        ajouterAuDevis(nom, prix, photo);
        fermerPopupAjout();
    } else {
        alert("Veuillez remplir tous les champs correctement !");
    }
}

// Impression du devis avec l'en-tête
function imprimerDevis() {
    document.getElementById('print-date').innerText = document.getElementById('date').value;
    
    document.getElementById('print-client-name').innerText = document.getElementById('client-name').value;
    document.getElementById('print-facture').innerText = document.getElementById('facture').value;
    document.getElementById('print-ice').innerText = document.getElementById('ice').value;

    window.print();
}

// Charger le devis au démarrage
chargerDevis();

function envoyerPhotoParWhatsApp() {
    const clientName = document.getElementById('client-name').value;
    const phone = document.getElementById('phone').value;

    if (!phone || !clientName) {
        alert("Veuillez remplir le nom du client et le numéro de téléphone.");
        return;
    }

    const message = `
        Bonjour ${clientName},
        Nous vous remercions pour votre confiance !
        Voici une copie de votre devis. Veuillez confirmer par téléphone.
        Merci et excellente journée !
    `.trim();

    // Capture de l'écran
    html2canvas(document.body).then(canvas => {
        // Convertir l'image en base64
        const imageBase64 = canvas.toDataURL();  // Image au format base64

        // Créer un message incluant l'URL de l'image (l'utilisateur devra télécharger l'image)
        const whatsappMessage = `
            ${message}
            Voici l'image de votre devis : ${imageBase64}
        `.trim();

        // L'URL WhatsApp pour envoyer le message
        const whatsappLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(whatsappMessage)}`;

        // Affichage de l'image et envoi du lien
        alert("Capture d'écran prête. Cliquez sur le lien pour ouvrir WhatsApp et envoyer l'image.");
        window.open(whatsappLink, '_blank');
    }).catch(error => {
        console.error("Erreur lors de la capture de la page :", error);
        alert("Une erreur s'est produite. Veuillez réessayer.");
    });
};
