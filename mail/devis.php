<?php
/**
 * Détails Import : envoi du formulaire de demande de devis.
 * À configurer : $DESTINATAIRE et $EXPEDITEUR (adresse du domaine).
 */
$DESTINATAIRE = 'contact@detailsimport.com';
$EXPEDITEUR   = 'site@detailsimport.com';
$COPIE        = 'com@detailsgroupe.com';   // copie cachée de chaque demande

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

// ----- Anti-spam (sans captcha) -----
// Les robots repérés reçoivent une fausse confirmation : ils ne savent pas qu'ils ont été bloqués.
$a_verifier = false;

// 1. Temps de remplissage (mesuré par le navigateur, en ms) : moins de 3 secondes = robot
$dt = isset($_POST['dt']) ? (int)$_POST['dt'] : 0;
if ($dt > 0) {
    if ($dt < 3000) retour($retour, 'ok');
} else {
    $a_verifier = true;   // navigateur sans JavaScript : on laisse passer mais on le signale
}

// 2. Liens : un vrai client n'a pas besoin de plusieurs liens
$tout = "$nom $societe $pays $message";
$nb_liens = preg_match_all('~(https?://|www\.|\[url|<a\s)~i', $tout);
if ($nb_liens > 2 || preg_match('~(https?://|www\.)~i', "$nom $societe $pays")) retour($retour, 'ok');

// 3. Robots de spam connus (signatures « RobertFum », phrase « je voulais connaître votre prix » traduite en masse)
$bas = function ($s) { return mb_strtolower(trim(preg_replace('~\s+~u', ' ', $s)), 'UTF-8'); };
// 3a. Pays recopié depuis le nom ou la société : aucun vrai client ne fait ça
if ($bas($pays) !== '' && ($bas($pays) === $bas($nom) || $bas($pays) === $bas($societe))) retour($retour, 'ok');
// 3b. Noms générés en un seul mot avec suffixe (RobertFum, JamesPax, DavidMag...)
$nom_robot = (bool)preg_match('~^[A-Z][a-z]{2,}(Fum|Pax|Mag|Cig|Tus|Cag|Rag|Wex|Lus|Nus)$~', $nom);
if ($nom_robot) retour($retour, 'ok');
// 3c. Message type du robot, dans les langues que le site ne parle pas : toujours du spam
$msg = $bas($message);
$court = mb_strlen($msg, 'UTF-8') < 160;
$modeles = ['htio sam znati', 'želio sam znati', 'zelio sam znati', 'volevo sapere il tuo prezzo', 'ego volo scire', 'ønskede at kende din pris',
    'wou jou prys ken', 'qiymətinizi bilmək', 'хотів дізнатися вашу ціну', 'исках да знам цената', 'vildi vita verð', 'meg akartam kérdezni az árát',
    'quería saber o seu prezo', 'volia saber el seu preu', 'ήθελα να μάθω την τιμή', 'saya ingin tahu harga', 'zure prezioa jakin', 'хотел узнать ваш прайс',
    'хотел узнать вашу цену', 'tôi muốn biết giá', 'fiyatınızı öğrenmek', 'të di çmimin', 'chtěl jsem vědět vaši cenu', 'ville vite prisen din',
    'halusin tietää hintasi', 'chciałem poznać cenę', 'ai voulu connaître votre prix', 'quería saber su precio', 'queria saber o seu preço',
    'wilde je prijs weten', 'ville veta ditt pris', 'norėjau sužinoti jūsų kainą', 'gribēju zināt jūsu cenu', 'tahtsin teada teie hinda',
    'am vrut să știu prețul', 'chcel som vedieť vašu cenu', 'želel sem vedeti vašo ceno'];
if ($court) {
    foreach ($modeles as $m) { if (mb_strpos($msg, $m, 0, 'UTF-8') !== false) retour($retour, 'ok'); }
}

// 4. Limite : 5 demandes par heure et par adresse IP
$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
$fichier = rtrim(sys_get_temp_dir(), '/') . '/di_devis_' . substr(hash('sha256', $ip . 'detailsimport'), 0, 32);
$heures = [];
if (is_file($fichier)) {
    $heures = array_filter(array_map('intval', explode(',', (string)@file_get_contents($fichier))), function ($h) { return $h > time() - 3600; });
}
if (count($heures) >= 5) retour($retour, 'ok');
$heures[] = time();
@file_put_contents($fichier, implode(',', $heures), LOCK_EX);

$sujet = '=?UTF-8?B?' . base64_encode(($a_verifier ? "[À vérifier] " : "") . "Demande de devis site : $produit ($societe)") . '?=';
$corps = "Nouvelle demande depuis detailsimport.com\n\n"
       . "Nom : $nom\nSociété : $societe\nE-mail : $email\nTéléphone : $tel\nPays : $pays\n"
       . "Secteur : $secteur\nProduit : $produit\nQuantité : $quantite\nLangue : $lang\n\n"
       . "Message :\n$message\n";
$entetes = "From: Site Détails Import <$EXPEDITEUR>\r\n"
         . "Reply-To: $email\r\n"
         . "Bcc: $COPIE\r\n"
         . "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n";

$ok = mail($DESTINATAIRE, $sujet, $corps, $entetes, '-f' . $EXPEDITEUR);
retour($retour, $ok ? 'ok' : 'erreur');
