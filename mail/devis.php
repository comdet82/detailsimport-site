<?php
/**
 * Détails Import : envoi du formulaire de demande de devis.
 * À configurer : $DESTINATAIRE et $EXPEDITEUR (adresse du domaine).
 */
$DESTINATAIRE = 'contact@detailsimport.com';
$EXPEDITEUR   = 'site@detailsimport.com';

function retour($url, $etat) {
    $url = (is_string($url) && strpos($url, '/') === 0 && strpos($url, '//') !== 0) ? $url : '/';
    header('Location: ' . $url . '?envoi=' . $etat . '#contact');
    exit;
}
function champ($nom, $max = 500) {
    $v = isset($_POST[$nom]) ? trim((string)$_POST[$nom]) : '';
    $v = str_replace(["\r", "\n", "%0a", "%0d"], ' ', $v);
    return mb_substr(strip_tags($v), 0, $max);
}

$retour = isset($_POST['retour']) ? $_POST['retour'] : '/';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') retour('/', 'erreur');
if (!empty($_POST['site_web'])) retour($retour, 'ok');            // robot (champ piège rempli)

$nom = champ('nom', 120); $societe = champ('societe', 160); $email = champ('email', 160);
$tel = champ('telephone', 40); $pays = champ('pays', 80); $secteur = champ('secteur', 80);
$produit = champ('produit', 120); $quantite = champ('quantite', 80); $lang = champ('lang', 2);
$message = isset($_POST['message']) ? mb_substr(strip_tags(trim($_POST['message'])), 0, 4000) : '';

if ($nom === '' || $societe === '' || $pays === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($_POST['rgpd'])) {
    retour($retour, 'erreur');
}

$sujet = '=?UTF-8?B?' . base64_encode("Demande de devis site : $produit ($societe)") . '?=';
$corps = "Nouvelle demande depuis detailsimport.com\n\n"
       . "Nom : $nom\nSociété : $societe\nE-mail : $email\nTéléphone : $tel\nPays : $pays\n"
       . "Secteur : $secteur\nProduit : $produit\nQuantité : $quantite\nLangue : $lang\n\n"
       . "Message :\n$message\n";
$entetes = "From: Site Détails Import <$EXPEDITEUR>\r\n"
         . "Reply-To: $email\r\n"
         . "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n";

$ok = mail($DESTINATAIRE, $sujet, $corps, $entetes, '-f' . $EXPEDITEUR);
retour($retour, $ok ? 'ok' : 'erreur');
