# Architecture SEO DPA TAP — préparation avant publication

Ce document contient les réglages et contenus à créer manuellement dans Shopify. Aucun blog, article, produit, handle ou redirection n’a été créé dans l’administration.

## 1. Audit vérifié dans le repository

- Branche locale : `main`, alignée sur `origin/main` au début de l’intervention.
- Modification préexistante préservée : dossier non suivi `.claude/`.
- Accueil : template `templates/index.json`, avec les sections hero, scrollytelling, bénéfices, achat, installation, galerie et FAQ.
- Produit sélectionné sur l’accueil : handle `plaque-nfc-google`.
- URL produit actuelle vérifiée : `/products/plaque-nfc-google`, réponse HTTP 200.
- Template produit actuel : `templates/product.json` → `sections/main-product.liquid`.
- Templates génériques existants : produit, collection, page, blog, article, recherche, panier, politiques rendues par Shopify.
- Canonical : `{{ canonical_url }}` est déjà rendu globalement dans `layout/theme.liquid`.
- Title et méta-description : alimentés globalement par `page_title` et `page_description`.
- `noindex` : aucune directive ajoutée par le repository.
- Données structurées avant intervention : aucune donnée Product, Article ou BreadcrumbList explicite dans le thème.
- Traces WordPress : aucune occurrence `wordpress`, `wp-admin`, `wp-content` ou `wp-json` dans le repository.
- Redirections : aucune règle de redirection n’est stockée dans le repository.
- Maillage avant intervention : l’accueil permet l’achat intégré, mais ne contient pas de lien HTML vérifié vers la page produit. Aucun lien Guides n’existait dans le pied de page.
- Domaine canonique vérifié : `https://digitalprojectagency.fr`.
- Sitemap racine : réponse HTTP 200. Il référence un produit, quatre pages, six collections et un blog sans article publié.
- Redirections Shopify : la requête Admin GraphQL a été validée avec le scope minimal `read_online_store_navigation`, mais son exécution reste bloquée par l’autorisation OAuth demandée dans un navigateur indisponible dans cette session.

### URLs présentes dans le sitemap

| Type | URL | Statut | H1 | Title | Méta-description |
|---|---|---:|---|---|---|
| Accueil | `/` | 200 | Un geste. Un avis. | Plaque NFC Avis Google pour Commerces — DPA TAP | 154 caractères, mentionne encore un QR code |
| Produit | `/products/plaque-nfc-google` | 200 | Plaque NFC Avis Google pour Commerce | Plaque NFC Avis Google pour Commerce — DPA TAP | 320 caractères, contient plusieurs mentions de QR code |
| Page | `/pages/contact` | 200 | Contact | Contact — DPA TAP | Absente |
| Page métier existante | `/pages/plaque-avis-google-restaurant` | 200 | Plaque NFC Avis Google pour Restaurant | Plaque NFC Avis Google pour Restaurant \| DPA TAP | 122 caractères |
| Page métier existante | `/pages/plaque-avis-google-coiffeur` | 200 | Plaque NFC Avis Google pour Coiffeur | Plaque NFC Avis Google pour Coiffeur \| DPA TAP | 120 caractères |
| Page métier existante | `/pages/plaque-avis-google-commerce` | 200 | Plaque NFC Avis Google pour Commerce | Plaque NFC Avis Google pour Commerce \| DPA TAP | 131 caractères |
| Collection | `/collections/frontpage` | 200 | Page d’accueil | Page d’accueil — DPA TAP | Absente |
| Collection hors sujet | `/collections/parfum` | 200 | parfum | parfum — DPA TAP | Absente |
| Collection hors sujet | `/collections/robes-dete` | 200 | robes d’été | robes d’été — DPA TAP | Absente |
| Collection hors sujet | `/collections/ensembles-legers` | 200 | ensembles légers | ensembles légers — DPA TAP | Absente |
| Collection hors sujet | `/collections/accessoires-solaires` | 200 | Accessoires solaires | Accessoires solaires — DPA TAP | Absente |
| Collection hors sujet | `/collections/best-sellers` | 200 | best sellers | best sellers — DPA TAP | Absente |
| Blog | `/blogs/actualites` | 200 | Actualités | Actualités — DPA TAP | Absente |

### Politiques existantes

Toutes les politiques ci-dessous répondent en 200 avec un H1 et un canonical propre :

- `/policies/privacy-policy`
- `/policies/refund-policy`
- `/policies/terms-of-service`
- `/policies/shipping-policy`
- `/policies/contact-information`
- `/policies/legal-notice`

`/policies/subscription-policy` répond en 404 et n’est donc pas une politique active.

### Pages orphelines et cannibalisation

- Le produit reçoit trois liens entrants, uniquement depuis les trois pages métier existantes.
- Contact, les trois pages métier, les six collections, le blog Actualités et les politiques n’ont aucun lien entrant détecté dans le HTML du corpus audité.
- Les trois pages métier sont déjà publiées et présentes dans le sitemap, alors que la consigne actuelle demande de ne pas publier ces pages. Elles ont été préservées sans modification ; une décision Admin est nécessaire pour les laisser actives, les dépublier ou les intégrer à une future stratégie métier.
- La page `/pages/plaque-avis-google-commerce` partage le même H1 que le produit et un title presque identique. Elle risque de concurrencer l’intention d’achat de la page produit.
- La comparaison lexicale entre le produit et les trois pages métier ne révèle pas de copie exacte : scores de Jaccard entre 0,268 et 0,300. Le problème principal est l’intention proche, pas un duplicata mot pour mot.
- Les collections `parfum`, `robes-dete`, `ensembles-legers`, `accessoires-solaires` et `best-sellers` sont hors sujet pour DPA TAP et envoient un signal thématique incohérent à Google.

## 2. Architecture cible

```text
Accueil /
├── Produit /products/plaque-nfc-avis-google
└── Guides /blogs/guides
    ├── /blogs/guides/plaque-nfc-avis-google-comment-ca-marche
    ├── /blogs/guides/nfc-ou-qr-code-avis-google
    └── /blogs/guides/comment-obtenir-lien-avis-google
```

Le template réutilisable `page.metier` est prêt pour de futures pages restaurant, coiffeur, boutique et hôtel. Ces pages ne doivent pas être créées à ce stade.

## 3. Carte des mots-clés et intentions

| Page | Mot-clé principal | Intention |
|---|---|---|
| Accueil | plaque NFC avis Google | Découverte générale de l’offre et de la marque |
| Produit | acheter plaque NFC avis Google | Achat |
| Guide 1 | comment fonctionne une plaque NFC avis Google | Information |
| Guide 2 | NFC ou QR code avis Google | Comparaison |
| Guide 3 | obtenir lien avis Google | Tutoriel |

## 4. Réglages de la page produit

- Produit existant à conserver : `plaque-nfc-google`.
- Handle cible : `plaque-nfc-avis-google`.
- URL cible : `/products/plaque-nfc-avis-google`.
- Template à affecter : `product.seo`.
- H1 géré par le template : `Plaque NFC Avis Google pour Commerce`.
- Title SEO : `Plaque NFC Avis Google pour Commerce | DPA TAP`.
- Méta-description : `Collectez plus d’avis Google avec une plaque NFC prête à l’emploi, personnalisée pour votre établissement, sans abonnement et compatible iPhone et Android.`

Avant de modifier le handle, relever toutes les occurrences de `/products/plaque-nfc-google` dans Navigation, Pages, Blogs, e-mails et campagnes. Lors du changement, créer ou vérifier la redirection permanente :

```text
/products/plaque-nfc-google → /products/plaque-nfc-avis-google
```

Le contenu éditable du template produit couvre : publics concernés, fonctionnement, parcours client, programmation, compatibilité, dimensions 10 × 10 cm, adhésif 3M, modèles noir et bleu, pack de deux, absence d’abonnement, installation, livraison, limites et FAQ.

La description produit actuelle dans Shopify doit aussi être remplacée avant publication, car elle affirme que la plaque contient un QR code. Cette description alimente les données structurées natives même si le nouveau template ne l’affiche pas. Contenu proposé pour le champ « Description » du produit :

```html
<p>La plaque DPA TAP ouvre le lien d’avis Google de votre établissement lorsqu’un client approche un smartphone compatible. Elle est programmée avant l’expédition avec le lien transmis pendant la commande.</p>
<p>Disponible en noir ou en bleu, au format 10 × 10 cm avec adhésif 3M, elle s’installe sur une surface plane, propre et sèche. Aucun abonnement ni application dédiée n’est nécessaire.</p>
```

## 5. Création manuelle du blog Guides

Dans Shopify Admin :

1. Créer un blog nommé `Guides` avec le handle `guides`.
2. Affecter le template `blog.guides` au blog.
3. Créer les trois articles ci-dessous en brouillon.
4. Affecter le template `article.guide` à chaque article.
5. Renseigner titre, extrait, image principale, title SEO, méta-description et handle.
6. Coller le corps HTML dans l’éditeur HTML de l’article.
7. Dans l’éditeur de thème du template `article.guide`, sélectionner le produit existant dans le champ « Produit lié ».
8. Après création des trois brouillons, sélectionner les articles complémentaires dans les blocs « Article lié ».
9. Dans le template `product.seo`, sélectionner le blog et les trois articles dans la section « Nos guides ».
10. Laisser les articles en brouillon jusqu’à validation éditoriale et technique.

## 6. Article 1 — fonctionnement d’une plaque NFC

- Titre/H1 : `Plaque NFC pour avis Google : comment ça marche ?`
- Handle : `plaque-nfc-avis-google-comment-ca-marche`
- URL : `/blogs/guides/plaque-nfc-avis-google-comment-ca-marche`
- Title SEO : `Plaque NFC pour avis Google : fonctionnement | DPA TAP`
- Méta-description : `Comprenez le fonctionnement d’une plaque NFC pour avis Google, de sa programmation à son utilisation par vos clients, sur iPhone et Android.`
- Extrait : `Découvrez ce qui se passe entre le geste du client, la lecture NFC et l’ouverture de votre formulaire d’avis Google.`

### Corps HTML

```html
<p>Une plaque NFC pour avis Google permet à un client d’ouvrir la fiche d’un établissement en approchant son téléphone. Le geste est simple, mais plusieurs éléments travaillent ensemble : une puce NFC, un lien d’avis Google et un smartphone compatible.</p>

<p>Voici le fonctionnement complet, côté commerçant comme côté client, avec les limites à connaître avant l’installation.</p>

<h2>Qu’est-ce que le NFC ?</h2>

<p>Le NFC, pour <em>Near Field Communication</em>, est une technologie de communication à très courte distance. Elle permet à un téléphone de lire une petite quantité d’information stockée dans une puce placée à quelques centimètres.</p>

<p>Dans une plaque d’avis Google, cette information est une adresse web. La puce est passive : elle n’a pas besoin de batterie ni de connexion électrique. Le téléphone fournit l’énergie nécessaire au moment de la lecture.</p>

<h2>Comment la plaque est-elle préparée pour le commerçant ?</h2>

<p>Chaque établissement possède un lien qui mène vers son formulaire d’avis Google. Ce lien est enregistré dans la puce avant l’expédition de la plaque.</p>

<p>Le commerçant transmet donc le nom exact de son établissement et, s’il l’a déjà, son lien direct pendant la commande. Si vous devez encore le récupérer, consultez notre tutoriel pour <a href="/blogs/guides/comment-obtenir-lien-avis-google">obtenir votre lien d’avis Google</a>.</p>

<p>Une fois programmée, la plaque arrive prête à être testée puis installée. Aucun compte DPA TAP ni abonnement n’est nécessaire pour conserver le lien dans la puce.</p>

<h2>Que se passe-t-il côté client ?</h2>

<ol>
  <li>Le client approche la zone NFC de son téléphone de la plaque.</li>
  <li>Le téléphone détecte le lien et affiche une notification.</li>
  <li>Le client touche la notification.</li>
  <li>La fiche Google ou le formulaire d’avis s’ouvre.</li>
  <li>Le client décide librement de publier une note et un commentaire.</li>
</ol>

<p>La plaque ne publie jamais un avis automatiquement. Elle réduit seulement le chemin entre la demande du commerçant et la page où le client peut s’exprimer.</p>

<h2>Quels smartphones sont compatibles ?</h2>

<p>La majorité des iPhone et des téléphones Android récents savent lire une puce NFC. L’expérience exacte varie toutefois selon le modèle.</p>

<h3>Sur iPhone</h3>

<p>Sur un iPhone compatible, la lecture se fait généralement en approchant la partie supérieure du téléphone. Une notification apparaît lorsque le lien est détecté.</p>

<h3>Sur Android</h3>

<p>Sur Android, l’antenne peut se trouver au centre ou en haut du dos du téléphone. Le NFC doit parfois être activé dans les réglages rapides ou dans les paramètres de connexion.</p>

<p>Un téléphone ancien, un NFC désactivé, une coque très épaisse ou un positionnement trop éloigné peuvent empêcher la détection immédiate. Il suffit souvent de déplacer lentement le téléphone au-dessus de la plaque.</p>

<h2>Comment le lien Google est-il programmé ?</h2>

<p>La puce contient une adresse web au format NFC. Lors de la préparation, DPA TAP inscrit le lien direct fourni pour l’établissement, puis vérifie qu’il peut être lu.</p>

<p>Si la fiche Google change, la puce peut être reprogrammée avec un téléphone et une application compatible. Il est préférable de tester le nouveau lien dans un navigateur privé avant de remplacer l’ancien.</p>

<h2>Où et comment installer la plaque ?</h2>

<p>Choisissez un emplacement visible au moment où l’expérience client se termine : près de la caisse, sur le comptoir d’accueil ou à la sortie. La plaque DPA TAP mesure 10 × 10 cm et possède un adhésif 3M au verso.</p>

<ol>
  <li>Choisissez une surface plane, propre et sèche.</li>
  <li>Testez la lecture avec plusieurs téléphones avant le collage.</li>
  <li>Nettoyez la surface et laissez-la sécher.</li>
  <li>Retirez la protection de l’adhésif.</li>
  <li>Positionnez la plaque une seule fois et appuyez uniformément.</li>
</ol>

<p>Évitez de la coller avant d’avoir testé le lien et validé l’emplacement : un adhésif prévu pour tenir durablement n’est pas conçu pour des déplacements répétés.</p>

<h2>Quels sont les avantages concrets ?</h2>

<ul>
  <li>Le client n’a pas d’adresse à saisir.</li>
  <li>Aucune application dédiée n’est nécessaire.</li>
  <li>La plaque ne demande ni batterie ni alimentation.</li>
  <li>Le lien est préparé avant l’expédition.</li>
  <li>Il n’y a pas d’abonnement lié au nombre de lectures.</li>
</ul>

<p>Le NFC est particulièrement adapté lorsque le commerçant peut montrer la plaque et accompagner le geste en quelques mots.</p>

<h2>Quelles sont les limites à connaître ?</h2>

<p>Une plaque NFC ne crée pas un avis à la place du client et ne garantit pas une hausse précise du nombre d’avis. Le client doit disposer d’un téléphone compatible, d’une connexion internet et, selon le parcours Google affiché, d’un compte Google.</p>

<p>La détection peut aussi demander un second essai si l’antenne du téléphone est mal positionnée. Enfin, le résultat dépend de la qualité du moment choisi : demander un avis après une expérience réelle et satisfaisante reste plus naturel que solliciter chaque personne sans contexte.</p>

<h2>Exemples d’utilisation</h2>

<h3>Dans un restaurant ou un café</h3>

<p>La plaque peut être placée près du terminal de paiement. L’équipe la présente au moment de l’encaissement, après s’être assurée que le client a terminé son expérience.</p>

<h3>Dans un salon de coiffure</h3>

<p>Le client peut approcher son téléphone pendant le passage en caisse, lorsque le résultat de la prestation est encore visible.</p>

<h3>Dans une boutique ou un hôtel</h3>

<p>Un emplacement à l’accueil ou à la sortie permet de proposer le geste sans interrompre l’achat, le séjour ou la prise en charge.</p>

<p>Vous hésitez entre plusieurs supports ? Consultez le comparatif <a href="/blogs/guides/nfc-ou-qr-code-avis-google">NFC ou QR code pour les avis Google</a>.</p>

<h2>Questions fréquentes</h2>

<h3>La plaque fonctionne-t-elle sans internet ?</h3>

<p>La lecture de la puce ne demande pas internet, mais le téléphone doit être connecté pour charger la fiche Google et publier un avis.</p>

<h3>Le client doit-il coller son téléphone à la plaque ?</h3>

<p>Non. Une très courte distance suffit. Il vaut mieux approcher lentement la zone NFC du téléphone sans le frapper contre la plaque.</p>

<h3>Peut-on programmer deux établissements sur une plaque ?</h3>

<p>Une plaque ouvre un lien à la fois. Pour deux établissements ou deux liens distincts, utilisez deux plaques et programmez chacune séparément.</p>

<h3>Le lien peut-il expirer ?</h3>

<p>La puce conserve l’adresse enregistrée. En revanche, si la fiche Google ou son lien change, il faudra vérifier puis reprogrammer la plaque.</p>

<p>Pour équiper votre établissement, vous pouvez <a href="/products/plaque-nfc-avis-google">découvrir la plaque NFC pour avis Google</a>, disponible en noir, en bleu et en pack de deux.</p>
```

## 7. Article 2 — comparaison NFC et QR code

- Titre/H1 : `NFC ou QR code : quelle solution pour les avis Google ?`
- Handle : `nfc-ou-qr-code-avis-google`
- URL : `/blogs/guides/nfc-ou-qr-code-avis-google`
- Title SEO : `NFC ou QR code pour les avis Google ? | DPA TAP`
- Méta-description : `Comparez NFC et QR code pour demander des avis Google : usages, compatibilité, rapidité, avantages et limites pour choisir sans parti pris.`
- Extrait : `NFC et QR code peuvent ouvrir le même lien d’avis Google. Comparez le geste, la compatibilité et les contraintes de chaque solution.`

### Corps HTML

```html
<p>NFC et QR code peuvent mener au même formulaire d’avis Google. La différence ne se situe donc pas dans la destination, mais dans le geste demandé au client et dans les téléphones compatibles.</p>

<p>Le bon choix dépend du lieu, du public et de la manière dont votre équipe présente la demande d’avis. Voici une comparaison sans dénigrer l’une ou l’autre technologie.</p>

<h2>Quelle est la différence entre NFC et QR code ?</h2>

<p>Une puce NFC transmet un lien lorsque le client approche un téléphone compatible. Un QR code représente ce lien sous forme graphique : le client le cadre avec l’appareil photo ou un lecteur intégré.</p>

<p>Dans les deux cas, le téléphone affiche ensuite une proposition d’ouverture. Le client doit encore confirmer, attendre le chargement de Google et choisir s’il souhaite laisser un avis.</p>

<h2>Combien d’actions le client doit-il effectuer ?</h2>

<h3>Avec le NFC</h3>

<ol>
  <li>Approcher le téléphone de la puce.</li>
  <li>Toucher la notification.</li>
  <li>Utiliser le formulaire Google.</li>
</ol>

<h3>Avec un QR code</h3>

<ol>
  <li>Ouvrir l’appareil photo si nécessaire.</li>
  <li>Cadrer le code.</li>
  <li>Toucher la notification ou le lien détecté.</li>
  <li>Utiliser le formulaire Google.</li>
</ol>

<p>Le NFC peut demander un geste de moins, mais il doit être présenté clairement. Un client qui ne sait pas où placer son téléphone peut prendre plus de temps qu’avec un QR code qu’il connaît déjà.</p>

<h2>Quelle solution est la plus compatible ?</h2>

<p>Le QR code bénéficie d’une compatibilité très large dès lors que le téléphone possède un appareil photo capable de le reconnaître. Il reste donc utile pour les appareils plus anciens ou lorsque le NFC est désactivé.</p>

<p>Le NFC fonctionne sur la majorité des smartphones récents. Sur certains appareils Android, il doit être activé. La position de l’antenne varie selon le modèle, ce qui peut demander de déplacer légèrement le téléphone.</p>

<h2>Quelle solution est la plus rapide ?</h2>

<p>Dans de bonnes conditions, les deux solutions ouvrent le même lien en quelques gestes. Le NFC est souvent direct lorsque le client approche correctement son téléphone. Le QR code est rapide lorsque le code est bien éclairé, suffisamment grand et entièrement visible.</p>

<p>La vitesse réelle dépend davantage de la clarté du support, de la connexion internet et de l’habitude du client que d’une supériorité absolue de la technologie.</p>

<h2>Avantages et limites du NFC</h2>

<h3>Avantages</h3>

<ul>
  <li>Un geste court et facile à montrer.</li>
  <li>Pas besoin d’ouvrir volontairement l’appareil photo sur la plupart des téléphones compatibles.</li>
  <li>La puce reste discrète dans le design du support.</li>
  <li>Le lien peut être reprogrammé.</li>
</ul>

<h3>Limites</h3>

<ul>
  <li>Certains téléphones anciens ne disposent pas du NFC.</li>
  <li>Le NFC peut être désactivé sur Android.</li>
  <li>L’emplacement de l’antenne n’est pas identique sur tous les appareils.</li>
  <li>Le geste doit parfois être expliqué la première fois.</li>
</ul>

<p>Pour comprendre le parcours en détail, lisez le guide sur le <a href="/blogs/guides/plaque-nfc-avis-google-comment-ca-marche">fonctionnement d’une plaque NFC</a>.</p>

<h2>Avantages et limites du QR code</h2>

<h3>Avantages</h3>

<ul>
  <li>Compatibilité étendue avec les smartphones équipés d’un appareil photo.</li>
  <li>Geste désormais bien identifié par de nombreux utilisateurs.</li>
  <li>Impression possible sur de nombreux supports.</li>
  <li>Coût de reproduction faible pour une version imprimée.</li>
</ul>

<h3>Limites</h3>

<ul>
  <li>Le code doit rester visible, net et suffisamment grand.</li>
  <li>Un reflet, une faible lumière, une impression abîmée ou un cadrage difficile peuvent gêner la lecture.</li>
  <li>Le client doit généralement orienter l’appareil photo vers le support.</li>
  <li>Un QR code imprimé doit être remplacé si le lien qu’il encode n’est plus valable, sauf s’il passe par une redirection que vous contrôlez.</li>
</ul>

<h2>Tableau comparatif</h2>

<table>
  <thead>
    <tr>
      <th>Critère</th>
      <th>NFC</th>
      <th>QR code</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Geste principal</td>
      <td>Approcher le téléphone</td>
      <td>Cadrer avec l’appareil photo</td>
    </tr>
    <tr>
      <td>Compatibilité</td>
      <td>Majorité des smartphones récents</td>
      <td>Très large avec un appareil photo compatible</td>
    </tr>
    <tr>
      <td>Visibilité technique</td>
      <td>Puce invisible dans le support</td>
      <td>Code graphique visible</td>
    </tr>
    <tr>
      <td>Conditions de lecture</td>
      <td>Bonne position de l’antenne et NFC actif</td>
      <td>Code net, éclairé et bien cadré</td>
    </tr>
    <tr>
      <td>Mise à jour du lien</td>
      <td>Puce reprogrammable</td>
      <td>Nouvelle impression si le lien encodé change</td>
    </tr>
  </tbody>
</table>

<h2>Dans quels cas choisir le NFC ?</h2>

<p>Le NFC est pertinent sur un comptoir ou à un accueil, lorsque l’équipe peut montrer le geste. Il convient bien à un support durable, installé à un endroit fixe, avec un design qui ne doit pas être dominé par un motif technique.</p>

<p>Il est également pratique si vous souhaitez pouvoir remplacer le lien enregistré sans réimprimer toute la plaque.</p>

<h2>Dans quels cas choisir le QR code ?</h2>

<p>Le QR code est utile quand la compatibilité la plus large est prioritaire, lorsque le support doit être distribué sur papier ou lorsque le client se trouve à une distance qui ne permet pas d’approcher son téléphone.</p>

<p>Il peut aussi servir dans un document, un e-mail ou une affiche temporaire. Sa présence visible indique immédiatement qu’une action de scan est possible.</p>

<h2>Pourquoi DPA TAP a choisi le NFC aujourd’hui</h2>

<p>DPA TAP vend actuellement une plaque NFC. Ce choix correspond à l’usage visé : un support fixe de 10 × 10 cm, posé près du client et présenté au moment opportun par le commerçant.</p>

<p>Ce positionnement ne signifie pas que le QR code est une mauvaise solution. Il répond simplement à d’autres situations. L’essentiel reste d’envoyer vers le bon lien, de tester le parcours et de demander uniquement des avis authentiques, sans avantage offert en échange.</p>

<h2>Questions fréquentes</h2>

<h3>NFC et QR code peuvent-ils ouvrir exactement le même lien ?</h3>

<p>Oui. Les deux technologies peuvent contenir l’adresse du même formulaire d’avis Google.</p>

<h3>Le NFC fonctionne-t-il à travers une coque ?</h3>

<p>Souvent oui, mais une coque très épaisse ou contenant du métal peut réduire la lecture. Un test sans accessoire permet d’identifier la cause.</p>

<h3>Un QR code fonctionne-t-il dans l’obscurité ?</h3>

<p>La caméra doit distinguer suffisamment le code. Une faible lumière ou des reflets peuvent ralentir ou empêcher la détection.</p>

<h3>Quelle solution garantit davantage d’avis ?</h3>

<p>Aucune ne garantit un nombre d’avis. Elles facilitent l’accès au formulaire ; la décision de publier appartient toujours au client.</p>

<p>Si le NFC correspond à votre comptoir, vous pouvez <a href="/products/plaque-nfc-avis-google">découvrir la plaque NFC pour avis Google</a>.</p>
```

## 8. Article 3 — obtenir le lien direct d’avis Google

- Titre/H1 : `Comment obtenir le lien direct vers ses avis Google ?`
- Handle : `comment-obtenir-lien-avis-google`
- URL : `/blogs/guides/comment-obtenir-lien-avis-google`
- Title SEO : `Obtenir son lien direct d’avis Google | DPA TAP`
- Méta-description : `Suivez les étapes pour obtenir, copier et tester le lien direct d’avis Google de votre établissement sur ordinateur ou téléphone avant de le transmettre.`
- Extrait : `Retrouvez le lien officiel qui ouvre la demande d’avis de votre établissement, puis testez-le avant de l’utiliser.`

### Corps HTML

```html
<p>Le lien direct d’avis Google évite de demander au client de rechercher votre établissement. Il ouvre le parcours prévu pour laisser une note et, s’il le souhaite, un commentaire.</p>

<p>L’interface Google évolue régulièrement. La méthode officielle consiste aujourd’hui à ouvrir votre fiche d’établissement, puis à utiliser l’action « Recevoir plus d’avis ». Voici la procédure sur ordinateur et sur téléphone, ainsi qu’une méthode de contrôle dans Google Maps.</p>

<h2>Avant de commencer</h2>

<p>Connectez-vous au compte Google qui gère la fiche de l’établissement. Vérifiez aussi que vous ouvrez la bonne fiche si votre compte en administre plusieurs.</p>

<p>Le nom, l’adresse et les photos affichés doivent correspondre à votre établissement. Un lien récupéré depuis une fiche homonyme peut envoyer les clients au mauvais endroit.</p>

<h2>Méthode officielle depuis votre fiche d’établissement sur ordinateur</h2>

<ol>
  <li>Connectez-vous au compte Google qui gère la fiche.</li>
  <li>Recherchez le nom exact de votre établissement dans Google.</li>
  <li>Dans les commandes de gestion de la fiche, sélectionnez « Voir les avis ».</li>
  <li>Sélectionnez ensuite « Recevoir plus d’avis ».</li>
  <li>Dans la fenêtre de partage, choisissez « Copier » pour copier le lien d’avis.</li>
  <li>Collez le lien dans un document temporaire afin de le tester.</li>
</ol>

<p>Selon la version de l’interface, les libellés peuvent être légèrement différents. Recherchez une action qui mentionne explicitement la réception ou la demande d’avis, pas seulement le partage de la fiche.</p>

<h2>Méthode depuis un téléphone</h2>

<ol>
  <li>Ouvrez Google ou Google Maps avec le compte qui gère l’établissement.</li>
  <li>Accédez à votre fiche d’établissement.</li>
  <li>Ouvrez la zone consacrée aux avis ou aux commandes de gestion.</li>
  <li>Choisissez « Recevoir plus d’avis » ou l’action de partage associée aux avis.</li>
  <li>Copiez le lien proposé.</li>
  <li>Collez-le dans les notes du téléphone ou envoyez-le-vous par e-mail pour le tester.</li>
</ol>

<p>Si l’action n’apparaît pas dans l’application, ouvrez un navigateur mobile, connectez-vous au bon compte et recherchez le nom de l’établissement. L’interface de gestion intégrée à la recherche Google peut alors afficher les commandes de la fiche.</p>

<h2>Que peut-on faire depuis Google Maps ?</h2>

<p>Google Maps est utile pour retrouver et contrôler la fiche. Recherchez l’établissement, ouvrez sa fiche puis vérifiez le nom, l’adresse et la section Avis.</p>

<p>Attention : le bouton « Partager » visible sur une fiche Maps peut copier un lien vers la fiche générale, et non un lien qui ouvre directement la demande d’avis. Utilisez-le uniquement comme solution de contrôle. Pour obtenir le lien destiné aux avis, privilégiez l’action « Recevoir plus d’avis » disponible dans les commandes du propriétaire.</p>

<h2>Comment tester le lien ?</h2>

<ol>
  <li>Ouvrez une fenêtre de navigation privée.</li>
  <li>Collez le lien dans la barre d’adresse.</li>
  <li>Vérifiez le nom et l’adresse de l’établissement.</li>
  <li>Vérifiez que le parcours permet bien de choisir une note et d’écrire un avis.</li>
  <li>Refaites le test sur un téléphone différent si possible.</li>
</ol>

<p>Ne publiez pas de faux avis pendant le test. Il suffit de vérifier que le bon écran s’ouvre, puis de fermer la fenêtre.</p>

<h2>Erreurs fréquentes</h2>

<h3>Copier le lien de la recherche Google</h3>

<p>Une adresse copiée depuis la page de résultats peut contenir de nombreux paramètres et ne pas ouvrir directement le formulaire d’avis. Utilisez le lien fourni par l’action « Recevoir plus d’avis ».</p>

<h3>Partager la mauvaise fiche</h3>

<p>Les enseignes qui possèdent plusieurs adresses doivent récupérer un lien pour chaque fiche. Vérifiez toujours l’adresse avant la programmation.</p>

<h3>Utiliser un lien raccourci non testé</h3>

<p>Un raccourcisseur ajoute un intermédiaire et peut cesser de fonctionner. Le lien officiel Google est préférable lorsque vous le programmez dans un support durable.</p>

<h3>Tester uniquement en étant connecté comme propriétaire</h3>

<p>Le propriétaire peut voir une interface différente de celle d’un client. Une fenêtre privée ou un autre téléphone permet de contrôler le parcours public.</p>

<h3>Promettre un avantage en échange d’un avis</h3>

<p>Google exige que les avis reflètent une expérience réelle et interdit d’offrir un produit, un service ou une réduction en échange d’un avis. Présentez le lien comme une invitation à donner un avis honnête, qu’il soit positif ou négatif.</p>

<h2>Où transmettre le lien pendant la commande DPA TAP ?</h2>

<p>Sur la page produit, choisissez le modèle et l’offre, puis indiquez le nom de l’établissement dans le champ prévu. Collez ensuite le lien dans le champ « Lien Google ».</p>

<p>Pour un pack de deux plaques, renseignez chaque plaque séparément. Vous pouvez utiliser le même lien pour deux emplacements du même établissement ou deux liens différents pour deux fiches distinctes.</p>

<p>Si vous n’avez pas encore le lien, indiquez au minimum le nom exact et l’adresse de la fiche dans la remarque de commande. La programmation devra être validée avant l’expédition.</p>

<h2>Questions fréquentes</h2>

<h3>Faut-il être propriétaire de la fiche pour obtenir le lien ?</h3>

<p>La méthode « Recevoir plus d’avis » est proposée dans les commandes de gestion de la fiche. Connectez-vous donc avec un compte autorisé à la gérer.</p>

<h3>Le lien fonctionne-t-il sur iPhone et Android ?</h3>

<p>Le lien est une adresse web. Il peut s’ouvrir sur les deux plateformes dans un navigateur ou dans une application Google disponible, sous réserve de connexion et de compatibilité du téléphone.</p>

<h3>Peut-on utiliser le même lien dans plusieurs supports ?</h3>

<p>Oui, si tous les supports concernent la même fiche. Pour plusieurs établissements, utilisez le lien propre à chaque fiche.</p>

<h3>Que faire si le lien ouvre la mauvaise adresse ?</h3>

<p>Ne le programmez pas. Retournez sur la fiche correcte, récupérez un nouveau lien et répétez le test en navigation privée.</p>

<p>Une fois le lien validé, vous pouvez le transmettre lors de la commande de votre <a href="/products/plaque-nfc-avis-google">plaque NFC pour avis Google</a>. Pour comprendre ce qui se passe ensuite, consultez le guide sur le <a href="/blogs/guides/plaque-nfc-avis-google-comment-ca-marche">fonctionnement de la plaque NFC</a> ou le comparatif <a href="/blogs/guides/nfc-ou-qr-code-avis-google">NFC ou QR code</a>.</p>

<p>Source de la procédure : <a href="https://support.google.com/business/answer/16816815?hl=fr">Aide officielle Fiche d’établissement Google — créer un lien pour demander des avis</a>.</p>
```

## 9. Maillage interne prévu

- Pied de page global : lien `Guides` vers `/blogs/guides`.
- Chaque article : lien contextuel vers `/products/plaque-nfc-avis-google` dans le corps et CTA produit éditable sous l’article.
- Guide 1 : liens vers les guides 2 et 3.
- Guide 2 : lien vers le guide 1.
- Guide 3 : liens vers les guides 1 et 2.
- Page produit : section « Nos guides » reliée au blog et aux trois brouillons ; les ressources brouillon ne sont pas résolues côté vitrine, donc la section reste masquée jusqu’à publication.
- Blog Guides : cartes HTML vers chaque article publié.

## 10. Données structurées préparées

- Produit : sortie native `{{ product | structured_data }}` de Shopify, alimentée par les variantes, prix, devise, disponibilité, URL et images réels.
- Articles : sortie native `{{ article | structured_data }}`, alimentée par l’auteur, les dates et l’image réels de l’article.
- Produit, articles, blog et pages métier : `BreadcrumbList` aligné sur le fil d’Ariane visible.
- Aucun `AggregateRating`, faux avis, faux stock, fausse date ou donnée invisible n’est ajouté.

## 11. Contrôles manuels avant publication

1. Contrôler visuellement le thème de développement à 320, 360, 375, 390, 414 et 430 px, puis sur desktop.
2. Vérifier la console JavaScript et l’absence de scroll horizontal dans un navigateur contrôlable.
3. Lancer Lighthouse sur la prévisualisation du thème de développement et comparer aux mesures de référence existantes.
4. Relire éditorialement les trois brouillons et ajouter leurs images principales avant publication.
5. Corriger les affirmations QR restantes dans les pages métier avant de leur affecter `page.metier`.
6. Valider la recommandation de redirection de la page commerce avant toute mutation.
7. Valider la dépublication Boutique en ligne des cinq collections héritées avant toute mutation.

## 12. Résultats techniques obtenus

- Thème utilisé : développement ID `202785456473`, distinct du thème live ID `202903585113`.
- OAuth Shopify Admin terminé avec des portées limitées aux produits, contenus, navigation et publications.
- Produit existant conservé, ID `gid://shopify/Product/16423046021465`, sans duplication.
- Handle actif : `plaque-nfc-avis-google`; l’ancien handle répond en HTTP 301 exact vers la nouvelle URL.
- Template produit `product.seo`, description corrigée sans QR, title SEO de 46 caractères et méta-description de 155 caractères.
- Aperçu du template produit SEO : un H1, huit H2, cinq H3 et canonical vers la nouvelle URL.
- Données structurées rendues : `BreadcrumbList`, `ProductGroup`, `Product`, `Offer` et `Brand`, alimentées par les données Shopify réelles.
- Variantes disponibles : Noir et Bleu, 39,50 € chacune.
- Blog `Guides` créé avec le handle `guides` et le template `blog.guides`.
- Trois articles créés avec le template `article.guide`, `isPublished: false`, `publishedAt: null`, corps HTML, extrait, auteur DPA TAP et métadonnées `global.title_tag` / `global.description_tag`.
- Les trois URLs d’articles répondent en 404 public et sont absentes du sitemap tant qu’elles restent en brouillon.
- Le blog Guides répond en HTTP 200 et le lien du pied de page de l’aperçu ne crée pas de 404.
- La section produit « Nos guides » est configurée avec les trois brouillons et reste absente du HTML public.
- Les trois pages métier pointent désormais vers `/products/plaque-nfc-avis-google`.
- Test variante Noir : panier HTTP 200, quantité 1, propriétés de ligne conservées.
- Test pack mixte : panier HTTP 200, quantité 2, deux lignes et deux jeux de propriétés distincts.
- Checkout : redirection Shopify HTTP 302 générée sans paiement.
- Nettoyage : panier de test vidé, quantité finale 0.
- Theme Check : 44 fichiers inspectés, zéro erreur, huit avertissements préexistants dans `layout/theme.liquid` et `sections/hero.liquid` concernant les ressources Google Fonts et les preloads d’images.
- Validateur Liquid de la compétence : exécution impossible dans le bundle local car le package `@shopify/theme-check-common` y est absent ; Theme Check Shopify CLI a été utilisé comme validation effective.
- Test navigateur, console JavaScript, captures responsive et Lighthouse : non exécutables, car aucun navigateur contrôlable n’est disponible dans cette session.
- Thème de développement synchronisé : ID `202785456473`. Aucune commande de publication du thème live, aucun commit et aucun push Git.

## 13. Audit Admin et recommandations différées

### Pages métier

- `plaque-avis-google-restaurant` : **conserver et adapter**. L’intention sectorielle est distincte, mais le corps affirme encore que le produit contient un QR code. Retirer ces affirmations, puis affecter `page.metier` lors de la mise en ligne du thème SEO.
- `plaque-avis-google-coiffeur` : **conserver et adapter** pour les mêmes raisons.
- `plaque-avis-google-commerce` : **recommandation de redirection 301 vers le produit**, car le H1 et l’intention d’achat font doublon avec la fiche produit. Aucune redirection n’a été exécutée, conformément à la demande de validation préalable.

### Collections hors sujet

Les cinq collections `parfum`, `robes-dete`, `ensembles-legers`, `accessoires-solaires` et `best-sellers` sont vides, sans lien dans les menus Shopify, mais encore publiées sur la Boutique en ligne, Shop, Point de vente, Inbox et Google & YouTube. Leurs intitulés correspondent à l’ancien univers textile Sarah Robe, mais l’API Admin ne fournit pas de champ d’attribution permettant de prouver formellement leur source.

Recommandation préparée : les dépublier d’abord de la **Boutique en ligne** (publication `gid://shopify/Publication/361120072025`), contrôler les éventuels backlinks et résultats indexés, puis décider au cas par cas d’une redirection vers une future catégorie pertinente ou d’une réponse 410. Ne pas rediriger automatiquement vers l’accueil. Aucune collection n’a été supprimée, dépubliée ou redirigée pendant cette intervention.

## 14. Édition du rendu visuel des guides

- L’image principale reste le champ natif `article.image`. En son absence, le template affiche une composition légère propre au sujet du guide.
- L’introduction reste le champ Extrait de Shopify, avec un texte de secours configurable dans le template.
- Le résumé visuel est placé au début du corps HTML sous la forme `<aside class="guide-essential">…</aside>`, puis séparé du corps principal par `<!--guide-body-->`.
- Tous les éléments situés après `<!--guide-body-->` restent le contenu SEO principal éditable dans Shopify.
- Les H2 du corps alimentent automatiquement le sommaire. Il n’est pas nécessaire de saisir les ancres manuellement.
- Les listes ordonnées deviennent des étapes, les listes simples deviennent des cartes et le tableau NFC/QR code devient une série de cartes sous 760 px.
- La carte produit utilise le produit sélectionné dans le template : image, titre, URL et prix minimum restent dynamiques.
- Les guides associés sont des blocs du template. Chaque bloc accepte un article, une image et des valeurs de secours afin de rester prévisualisable tant que les articles sont brouillons.
