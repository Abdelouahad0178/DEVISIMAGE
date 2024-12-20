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

// Afficher le devis
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
                    style="max-width: 120px; max-height: 120px; object-fit: contain;">
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
        input.value = devis[index].prix;
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
        input.value = devis[index].quantite;
    }
}

// Supprimer un produit du devis
function supprimerProduit(index) {
    devis.splice(index, 1);
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
    const photoInput = document.getElementById('ajout-photo');
    const file = photoInput.files[0];

    if (nom && prix > 0 && quantite > 0 && file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const photoBase64 = e.target.result; // URL de l'image en Base64
            ajouterAuDevis(nom, prix, photoBase64); // Ajout au devis avec l'image
            fermerPopupAjout();
        };
        reader.readAsDataURL(file);
    } else {
        alert("Veuillez remplir tous les champs correctement !");
    }
}


// Afficher les options d'impression
function afficherOptionsImpression() {
    document.getElementById('popup-impression').style.display = 'block';
}

// Fermer les options d'impression
function fermerOptionsImpression() {
    document.getElementById('popup-impression').style.display = 'none';
}

// Appliquer les styles personnalisés et imprimer



function appliquerStylesEtImprimer() {
    const fontFamily = document.getElementById('font-family').value;
    const fontSize = document.getElementById('font-size').value + 'px';
    const fontWeight = document.getElementById('font-weight').value;
    const textColor = document.getElementById('text-color').value;
    const backgroundColor = document.getElementById('background-color').value;

    // Ajouter une classe pour le style d'impression
    document.documentElement.style.setProperty('--print-background-color', backgroundColor);
    document.body.style.fontFamily = fontFamily;
    document.body.style.fontSize = fontSize;
    document.body.style.fontWeight = fontWeight;
    document.body.style.color = textColor;

    fermerOptionsImpression();

    setTimeout(() => window.print(), 500);
}

// Charger le devis au démarrage
chargerDevis();

// Envoyer le devis par WhatsApp
function envoyerPhotoParWhatsApp() {
    const clientName = document.getElementById('client-name').value;
    const phone = document.getElementById('phone').value;

    if (!phone || !clientName) {
        alert("Veuillez remplir le nom du client et le numéro de téléphone.");
        return;
    }

    const message = `Bonjour ${clientName}, Voici votre devis.`;

    html2canvas(document.body).then(canvas => {
        const imageBase64 = canvas.toDataURL();
        const whatsappLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
        window.open(whatsappLink, '_blank');
    });
}
