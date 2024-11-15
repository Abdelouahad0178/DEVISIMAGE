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
                    step="0.01" 
                    data-index="${index}" 
                    onchange="mettreAJourPrix(this)">
                DH
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
                <img src="${produit.image}" alt="${produit.nom}" style="width: 50px; height: 50px; object-fit: cover;">
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

// Fonction pour imprimer le devis
function imprimerDevis() {
    const printContents = document.getElementById('devis-container').innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
}

// Charger le devis au démarrage
chargerDevis();
