const storageKey = "koolAidCardVault";
const postStorageKey = "koolAidOwnerPosts";
const ownerSessionKey = "koolAidOwnerUnlocked";
const ownerPasscode = "3.141592KoolAid";
const supabaseConfig = window.KOOL_AID_SUPABASE || {};
const supabaseClient =
  window.supabase && supabaseConfig.url && supabaseConfig.anonKey
    ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey)
    : null;

const demoCards = [
  {
    player: "Anthony Edwards",
    team: "Minnesota Timberwolves",
    sport: "Basketball",
    type: "Rookie",
    year: 2020,
    set: "Prizm Silver",
    grade: "PSA 10",
    value: 850,
    printRun: "",
    variation: "Silver",
    favorite: true,
    topPull: true,
    spotlight: true,
    image:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80",
  },
  {
    player: "Patrick Mahomes",
    team: "Kansas City Chiefs",
    sport: "Football",
    type: "Autograph",
    year: 2017,
    set: "National Treasures",
    grade: "BGS 9.5",
    value: 2400,
    printRun: "/99",
    variation: "Autograph",
    favorite: true,
    topPull: false,
    spotlight: false,
    image:
      "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=800&q=80",
  },
  {
    player: "Shohei Ohtani",
    team: "Los Angeles Dodgers",
    sport: "Baseball",
    type: "Parallel",
    year: 2018,
    set: "Topps Chrome Refractor",
    grade: "Raw",
    value: 620,
    printRun: "",
    variation: "Refractor",
    favorite: false,
    topPull: false,
    spotlight: false,
    image:
      "https://images.unsplash.com/photo-1508344928928-7165b67de128?auto=format&fit=crop&w=800&q=80",
  },
  {
    player: "Lionel Messi",
    team: "Inter Miami",
    sport: "Soccer",
    type: "Graded",
    year: 2022,
    set: "World Cup Mosaic",
    grade: "PSA 10",
    value: 410,
    printRun: "",
    variation: "Mosaic",
    favorite: false,
    topPull: false,
    spotlight: false,
    image:
      "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80",
  },
  {
    player: "C.J. Stroud",
    team: "Houston Texans",
    sport: "Football",
    type: "Rookie",
    year: 2023,
    set: "Donruss Optic",
    grade: "Raw",
    value: 180,
    printRun: "",
    variation: "Optic",
    favorite: true,
    topPull: false,
    spotlight: false,
    image:
      "https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=800&q=80",
  },
  {
    player: "Victor Wembanyama",
    team: "San Antonio Spurs",
    sport: "Basketball",
    type: "Parallel",
    year: 2023,
    set: "Select Courtside",
    grade: "Raw",
    value: 320,
    printRun: "",
    variation: "Courtside",
    favorite: false,
    topPull: false,
    spotlight: false,
    image:
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=800&q=80",
  },
];

const cardGrid = document.querySelector("#cardGrid");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#searchInput");
const sportFilter = document.querySelector("#sportFilter");
const typeFilter = document.querySelector("#typeFilter");
const sortSelect = document.querySelector("#sortSelect");
const ownerLoginForm = document.querySelector("#ownerLoginForm");
const loginMessage = document.querySelector("#loginMessage");
const addCardForm = document.querySelector("#addCardForm");
const cardPhotoInput = document.querySelector("#cardPhotoInput");
const openCamera = document.querySelector("#openCamera");
const closeCamera = document.querySelector("#closeCamera");
const capturePhoto = document.querySelector("#capturePhoto");
const cameraPanel = document.querySelector("#cameraPanel");
const cameraVideo = document.querySelector("#cameraVideo");
const photoEditor = document.querySelector("#photoEditor");
const photoEditorCanvas = document.querySelector("#photoEditorCanvas");
const rotateLeft = document.querySelector("#rotateLeft");
const rotateRight = document.querySelector("#rotateRight");
const brightnessControl = document.querySelector("#brightnessControl");
const cropXControl = document.querySelector("#cropXControl");
const cropYControl = document.querySelector("#cropYControl");
const cropWidthControl = document.querySelector("#cropWidthControl");
const cropHeightControl = document.querySelector("#cropHeightControl");
const applyPhotoEdits = document.querySelector("#applyPhotoEdits");
const photoPreview = document.querySelector("#photoPreview");
const photoPreviewGrid = document.querySelector("#photoPreviewGrid");
const removePhoto = document.querySelector("#removePhoto");
const resetCards = document.querySelector("#resetCards");
const lockOwnerTools = document.querySelector("#lockOwnerTools");
const saveCardButton = document.querySelector("#saveCardButton");
const cancelEdit = document.querySelector("#cancelEdit");
const topPullMedia = document.querySelector("#topPullMedia");
const topPullTitle = document.querySelector("#topPullTitle");
const topPullText = document.querySelector("#topPullText");
const topPullSport = document.querySelector("#topPullSport");
const topPullGrade = document.querySelector("#topPullGrade");
const topPullSet = document.querySelector("#topPullSet");
const spotlightDisplay = document.querySelector("#spotlightDisplay");
const postGrid = document.querySelector("#postGrid");
const postEmptyState = document.querySelector("#postEmptyState");
const postForm = document.querySelector("#postForm");
const savePostButton = document.querySelector("#savePostButton");
const cancelPostEdit = document.querySelector("#cancelPostEdit");
const viewSections = document.querySelectorAll("[data-view]");
const viewLinks = document.querySelectorAll("[data-view-link]");

const statEls = {
  total: document.querySelector("#totalCards"),
  graded: document.querySelector("#gradedCards"),
  favorites: document.querySelector("#favoriteCards"),
};

let cards = loadCards();
let posts = loadPosts();
let selectedPhotos = [];
let pendingPhotoQueue = [];
let cameraStream = null;
let editorImage = null;
let editorRotation = 0;
let editingCardId = "";
let editingPostId = "";
let ownerUnlocked = sessionStorage.getItem(ownerSessionKey) === "true";

function showView(viewName) {
  viewSections.forEach((section) => {
    section.hidden = section.dataset.view !== viewName;
  });

  viewLinks.forEach((link) => {
    link.classList.toggle("active-view", link.dataset.viewLink === viewName);
  });

  const target = document.querySelector(`[data-view="${viewName}"]`);

  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function getViewFromHash() {
  const hash = window.location.hash.replace("#", "");
  const validViews = ["home", "collection", "featured", "posts", "add-card"];
  return validViews.includes(hash) ? hash : "home";
}

function loadCards() {
  const savedCards = localStorage.getItem(storageKey);

  if (!savedCards) {
    return demoCards.map(normalizeCard);
  }

  try {
    const parsedCards = JSON.parse(savedCards);
    return Array.isArray(parsedCards) ? parsedCards.map(normalizeCard) : demoCards.map(normalizeCard);
  } catch {
    return demoCards.map(normalizeCard);
  }
}

function normalizeCard(card) {
  return {
    id: card.id || createCardId(),
    ...card,
  };
}

function createCardId() {
  if (window.crypto?.randomUUID) {
    return crypto.randomUUID();
  }

  return `card-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function saveCards() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(cards));
    return true;
  } catch {
    window.alert("The browser ran out of photo storage. Remove a large photo or use an image URL instead.");
    return false;
  }
}

async function loadSupabaseData() {
  if (!supabaseClient) {
    return;
  }

  const [{ data: cardRows, error: cardError }, { data: postRows, error: postError }] =
    await Promise.all([
      supabaseClient.from("cards").select("data").order("updated_at", { ascending: false }),
      supabaseClient.from("posts").select("data").order("created_at", { ascending: false }),
    ]);

  if (cardError || postError) {
    window.alert("Supabase is connected, but the site could not load the database yet. Check your tables and policies.");
    return;
  }

  if (Array.isArray(cardRows)) {
    cards = cardRows.map((row) => normalizeCard(row.data));
    localStorage.setItem(storageKey, JSON.stringify(cards));
  }

  if (Array.isArray(postRows)) {
    posts = postRows.map((row) => normalizePost(row.data));
    localStorage.setItem(postStorageKey, JSON.stringify(posts));
  }

  renderOwnerState();
  showView(getViewFromHash());
}

async function upsertSupabaseCard(card) {
  if (!supabaseClient) {
    return true;
  }

  const { error } = await supabaseClient.from("cards").upsert({
    id: card.id,
    data: card,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    window.alert("The card saved in this browser, but Supabase did not accept the update.");
    return false;
  }

  return true;
}

async function deleteSupabaseCard(cardId) {
  if (!supabaseClient) {
    return true;
  }

  const { error } = await supabaseClient.from("cards").delete().eq("id", cardId);

  if (error) {
    window.alert("The card was removed in this browser, but Supabase did not accept the delete.");
    return false;
  }

  return true;
}

function loadPosts() {
  const savedPosts = localStorage.getItem(postStorageKey);

  if (!savedPosts) {
    return [];
  }

  try {
    const parsedPosts = JSON.parse(savedPosts);
    return Array.isArray(parsedPosts) ? parsedPosts.map(normalizePost) : [];
  } catch {
    return [];
  }
}

function normalizePost(post) {
  return {
    id: post.id || createCardId(),
    date: post.date || new Date().toISOString(),
    ...post,
  };
}

function savePosts() {
  try {
    localStorage.setItem(postStorageKey, JSON.stringify(posts));
    return true;
  } catch {
    window.alert("The browser could not save that post.");
    return false;
  }
}

async function upsertSupabasePost(post) {
  if (!supabaseClient) {
    return true;
  }

  const { error } = await supabaseClient.from("posts").upsert({
    id: post.id,
    data: post,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    window.alert("The post saved in this browser, but Supabase did not accept the update.");
    return false;
  }

  return true;
}

async function deleteSupabasePost(postId) {
  if (!supabaseClient) {
    return true;
  }

  const { error } = await supabaseClient.from("posts").delete().eq("id", postId);

  if (error) {
    window.alert("The post was removed in this browser, but Supabase did not accept the delete.");
    return false;
  }

  return true;
}

function formatCurrency(value) {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getVisibleCards() {
  const query = searchInput.value.trim().toLowerCase();
  const sport = sportFilter.value;
  const type = typeFilter.value;

  return cards
    .filter((card) => {
      const searchText =
        `${card.player} ${card.team} ${card.sport} ${card.type} ${card.set} ${card.grade} ${card.printRun || ""} ${card.variation || ""}`.toLowerCase();
      const matchesFavorite = card.favorite;
      const matchesSearch = !query || searchText.includes(query);
      const matchesSport = sport === "all" || card.sport === sport;
      const matchesType = type === "all" || card.type === type;
      return matchesFavorite && matchesSearch && matchesSport && matchesType;
    })
    .sort((a, b) => {
      if (sortSelect.value === "favorite") {
        return Number(b.favorite) - Number(a.favorite) || b.value - a.value;
      }

      if (sortSelect.value === "year") {
        return Number(b.year) - Number(a.year);
      }

      if (sortSelect.value === "player") {
        return a.player.localeCompare(b.player);
      }

      return Number(b.value) - Number(a.value);
    });
}

function renderCards() {
  const visibleCards = getVisibleCards();

  cardGrid.innerHTML = visibleCards
    .map((card) => {
      const cardImages = getCardImages(card);
      const primaryImage = cardImages[0] || fallbackImage(card.sport);
      const extraCount = Math.max(0, cardImages.length - 1);

      return `
        <article class="collection-card">
          <div class="card-photo" style="background-image: url(&quot;${escapeHtml(primaryImage)}&quot;)">
            <div class="card-badges">
              <span class="pill">${card.type}</span>
              ${extraCount ? `<span class="pill">${extraCount + 1} Photos</span>` : ""}
              ${card.favorite ? '<span class="pill gold">Favorite</span>' : ""}
            </div>
          </div>
          ${
            cardImages.length > 1
              ? `<div class="card-thumbs">${cardImages
                  .slice(0, 4)
                  .map((image) => `<span style="background-image: url(&quot;${escapeHtml(image)}&quot;)"></span>`)
                  .join("")}</div>`
              : ""
          }
          <div class="card-body">
            <h3>${escapeHtml(card.player)}</h3>
            <p class="card-meta">${escapeHtml(card.year)} ${escapeHtml(card.set)} · ${escapeHtml(card.team)}</p>
            <p class="card-tags">
              <span>${escapeHtml(card.variation || "Base")}</span>
              <span>${escapeHtml(card.printRun || "Not numbered")}</span>
            </p>
            <div class="card-footer">
              <span>${escapeHtml(card.grade || "Raw")} · ${escapeHtml(card.sport)}</span>
              <strong>${formatCurrency(card.value)}</strong>
            </div>
            ${
              ownerUnlocked
                ? `<div class="card-actions">
              <button class="button secondary" data-edit-card="${escapeHtml(card.id)}" type="button">Edit Details</button>
              <button class="button secondary" data-toggle-spotlight="${escapeHtml(card.id)}" type="button">
                ${card.spotlight ? "Remove Tradeable" : "Tradeable"}
              </button>
              <button class="button secondary" data-toggle-favorite="${escapeHtml(card.id)}" type="button">
                ${card.favorite ? "Unfavorite" : "Favorite"}
              </button>
              <button class="button danger" data-delete-card="${escapeHtml(card.id)}" type="button">Delete</button>
            </div>`
                : ""
            }
          </div>
        </article>
      `;
    })
    .join("");

  emptyState.hidden = visibleCards.length > 0;
  updateStats();
  renderSpotlight();
}

function getCardImages(card) {
  if (Array.isArray(card.images) && card.images.length) {
    return card.images;
  }

  return card.image ? [card.image] : [];
}

function updateStats() {
  statEls.total.textContent = cards.length;
  statEls.graded.textContent = cards.filter((card) => card.type === "Graded" || /psa|bgs|sgc/i.test(card.grade)).length;
  statEls.favorites.textContent = cards.filter((card) => card.favorite).length;
}

function renderSpotlight() {
  const spotlightCards = cards.filter((card) => card.spotlight);
  const topPull = spotlightCards[0];

  if (!topPull) {
    topPullMedia.style.backgroundImage = "";
    topPullTitle.textContent = "No tradeable card selected";
    topPullText.textContent = "Use the Tradeable button on a listing to feature it here.";
    topPullSport.textContent = "None";
    topPullGrade.textContent = "None";
    topPullSet.textContent = "None";
  } else {
    const topPullImages = getCardImages(topPull);
    topPullMedia.style.backgroundImage = `linear-gradient(180deg, rgba(23, 27, 34, 0), rgba(23, 27, 34, 0.7)), url("${topPullImages[0] || fallbackImage(topPull.sport)}")`;
    topPullTitle.textContent = `${topPull.player} ${topPull.year} ${topPull.variation || topPull.type}`;
    topPullText.textContent = `${topPull.team} · ${topPull.printRun || "Not numbered"} · ${formatCurrency(topPull.value)}`;
    topPullSport.textContent = topPull.sport || "None";
    topPullGrade.textContent = topPull.grade || "Raw";
    topPullSet.textContent = topPull.set || "None";
  }

  if (spotlightCards.length > 1) {
    const extraSpotlights = spotlightCards.slice(1).map((card) => card.player).join(", ");
    topPullText.textContent = `${topPullText.textContent} · Also tradeable: ${extraSpotlights}`;
  }

  spotlightDisplay.innerHTML = spotlightCards.length
    ? renderSpotlightCards(spotlightCards)
    : '<p class="empty-state">No tradeable cards selected yet.</p>';

}

function renderSpotlightCards(displayCards) {
  return displayCards
        .map((card) => {
          const images = getCardImages(card);
          return `
            <article class="favorite-card">
              <span style="background-image: url(&quot;${escapeHtml(images[0] || fallbackImage(card.sport))}&quot;)"></span>
              <div>
                <strong>${escapeHtml(card.player)}</strong>
                <small>${escapeHtml(card.year)} ${escapeHtml(card.set)} · ${escapeHtml(card.variation || "Base")}</small>
              </div>
            </article>
          `;
        })
        .join("");
}

function renderOwnerState() {
  ownerLoginForm.hidden = ownerUnlocked;
  addCardForm.hidden = !ownerUnlocked;
  postForm.hidden = !ownerUnlocked;
  resetCards.hidden = !ownerUnlocked;
  lockOwnerTools.hidden = !ownerUnlocked;
  loginMessage.textContent = "";
  renderCards();
  renderPosts();
}

function renderPosts() {
  postGrid.innerHTML = posts
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(
      (post) => `
        <article class="post-card">
          <span class="pill">${escapeHtml(post.type)}</span>
          <h3>${escapeHtml(post.title)}</h3>
          <p>${escapeHtml(post.body)}</p>
          <small>${new Date(post.date).toLocaleDateString()}</small>
          ${
            ownerUnlocked
              ? `<div class="card-actions">
                  <button class="button secondary" data-edit-post="${escapeHtml(post.id)}" type="button">Edit Post</button>
                  <button class="button danger" data-delete-post="${escapeHtml(post.id)}" type="button">Delete Post</button>
                </div>`
              : ""
          }
        </article>
      `,
    )
    .join("");

  postEmptyState.hidden = posts.length > 0;
}

function resetPostForm() {
  editingPostId = "";
  savePostButton.textContent = "Publish Update";
  cancelPostEdit.hidden = true;
  postForm.reset();
}

viewLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const viewName = link.dataset.viewLink;

    if (!viewName) {
      return;
    }

    event.preventDefault();
    history.pushState(null, "", `#${viewName}`);
    showView(viewName);
  });
});

window.addEventListener("hashchange", () => {
  showView(getViewFromHash());
});

function fallbackImage(sport) {
  const fallbacks = {
    Basketball:
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=800&q=80",
    Football:
      "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=800&q=80",
    Baseball:
      "https://images.unsplash.com/photo-1508344928928-7165b67de128?auto=format&fit=crop&w=800&q=80",
    Soccer:
      "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80",
  };

  return fallbacks[sport] || fallbacks.Basketball;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("error", () => reject(new Error("Could not read image.")));
    reader.addEventListener("load", () => {
      const image = new Image();

      image.addEventListener("error", () => reject(new Error("Could not load image.")));
      image.addEventListener("load", () => {
        const maxSize = 900;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      });

      image.src = reader.result;
    });

    reader.readAsDataURL(file);
  });
}

function loadImage(photoData) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Could not load image.")));
    image.src = photoData;
  });
}

function getEditorCrop() {
  const cropX = Number(cropXControl.value) / 100;
  const cropY = Number(cropYControl.value) / 100;
  const cropWidth = Math.min(Number(cropWidthControl.value) / 100, 1 - cropX);
  const cropHeight = Math.min(Number(cropHeightControl.value) / 100, 1 - cropY);

  return {
    x: cropX,
    y: cropY,
    width: Math.max(0.05, cropWidth),
    height: Math.max(0.05, cropHeight),
  };
}

function drawEditor() {
  if (!editorImage) {
    return;
  }

  const crop = getEditorCrop();
  const sourceX = editorImage.width * crop.x;
  const sourceY = editorImage.height * crop.y;
  const sourceWidth = editorImage.width * crop.width;
  const sourceHeight = editorImage.height * crop.height;
  const rotated = Math.abs(editorRotation % 180) === 90;
  const maxSize = 720;
  const outputRatio = rotated ? sourceHeight / sourceWidth : sourceWidth / sourceHeight;
  const outputWidth = outputRatio >= 1 ? maxSize : Math.round(maxSize * outputRatio);
  const outputHeight = outputRatio >= 1 ? Math.round(maxSize / outputRatio) : maxSize;

  photoEditorCanvas.width = outputWidth;
  photoEditorCanvas.height = outputHeight;

  const context = photoEditorCanvas.getContext("2d");
  context.clearRect(0, 0, outputWidth, outputHeight);
  context.filter = `brightness(${brightnessControl.value}%)`;
  context.save();
  context.translate(outputWidth / 2, outputHeight / 2);
  context.rotate((editorRotation * Math.PI) / 180);

  const drawWidth = rotated ? outputHeight : outputWidth;
  const drawHeight = rotated ? outputWidth : outputHeight;
  context.drawImage(
    editorImage,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    -drawWidth / 2,
    -drawHeight / 2,
    drawWidth,
    drawHeight,
  );
  context.restore();
  context.filter = "none";
}

async function openPhotoEditor(photoData) {
  editorImage = await loadImage(photoData);
  editorRotation = 0;
  brightnessControl.value = 100;
  cropXControl.value = 0;
  cropYControl.value = 0;
  cropWidthControl.value = 100;
  cropHeightControl.value = 100;
  photoEditor.hidden = false;
  drawEditor();
  setPreviewPhoto(photoEditorCanvas.toDataURL("image/jpeg", 0.78));
}

function setPreviewPhoto(photoData) {
  const savedPhotoMarkup = selectedPhotos
    .map(
      (photo, index) => `
        <div class="photo-preview-item">
          <img src="${escapeHtml(photo)}" alt="Selected card photo ${index + 1}" />
          <button class="text-button" data-remove-photo="${index}" type="button">Remove</button>
        </div>
      `,
    )
    .join("");

  photoPreviewGrid.innerHTML = `${savedPhotoMarkup}
    <div class="photo-preview-item">
      <img src="${escapeHtml(photoData)}" alt="Edited card preview" />
      <span>Editing</span>
    </div>
  `;
  photoPreview.hidden = false;
}

function renderSelectedPhotos() {
  photoPreviewGrid.innerHTML = selectedPhotos
    .map(
      (photo, index) => `
        <div class="photo-preview-item">
          <img src="${escapeHtml(photo)}" alt="Selected card photo ${index + 1}" />
          <button class="text-button" data-remove-photo="${index}" type="button">Remove</button>
        </div>
      `,
    )
    .join("");

  photoPreview.hidden = selectedPhotos.length === 0 && !editorImage;
}

function setEditMode(cardId) {
  const card = cards.find((entry) => entry.id === cardId);

  if (!card) {
    return;
  }

  editingCardId = cardId;
  pendingPhotoQueue = [];
  editorImage = null;
  photoEditor.hidden = true;
  selectedPhotos = getCardImages(card).slice();

  addCardForm.elements.namedItem("player").value = card.player || "";
  addCardForm.elements.namedItem("team").value = card.team || "";
  addCardForm.elements.namedItem("sport").value = card.sport || "Basketball";
  addCardForm.elements.namedItem("type").value = card.type || "Rookie";
  addCardForm.elements.namedItem("year").value = card.year || "";
  addCardForm.elements.namedItem("set").value = card.set || "";
  addCardForm.elements.namedItem("grade").value = card.grade || "";
  addCardForm.elements.namedItem("value").value = card.value || "";
  addCardForm.elements.namedItem("printRun").value = card.printRun || "";
  addCardForm.elements.namedItem("variation").value = card.variation || "";
  addCardForm.elements.namedItem("image").value = "";
  addCardForm.elements.namedItem("favorite").checked = Boolean(card.favorite);
  addCardForm.elements.namedItem("spotlight").checked = Boolean(card.spotlight);

  renderSelectedPhotos();
  saveCardButton.textContent = "Save Changes";
  cancelEdit.hidden = false;
  history.pushState(null, "", "#add-card");
  showView("add-card");
}

function resetEditMode() {
  editingCardId = "";
  saveCardButton.textContent = "Add to Collection";
  cancelEdit.hidden = true;
}

function clearSelectedPhotos() {
  selectedPhotos = [];
  pendingPhotoQueue = [];
  editorImage = null;
  cardPhotoInput.value = "";
  photoEditor.hidden = true;
  photoPreview.hidden = true;
  photoPreviewGrid.innerHTML = "";
}

async function openNextPendingPhoto() {
  const nextPhoto = pendingPhotoQueue.shift();

  if (!nextPhoto) {
    return;
  }

  await openPhotoEditor(nextPhoto);
}

cardPhotoInput.addEventListener("change", async () => {
  const files = Array.from(cardPhotoInput.files);

  if (!files.length) {
    return;
  }

  try {
    const resizedPhotos = [];

    for (const file of files) {
      resizedPhotos.push(await resizeImage(file));
    }

    pendingPhotoQueue = pendingPhotoQueue.concat(resizedPhotos);
    cardPhotoInput.value = "";

    if (!editorImage) {
      await openNextPendingPhoto();
    }
  } catch {
    window.alert("That photo could not be added. Try another image.");
  }
});

removePhoto.addEventListener("click", clearSelectedPhotos);

photoPreviewGrid.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-photo]");

  if (!removeButton) {
    return;
  }

  selectedPhotos.splice(Number(removeButton.dataset.removePhoto), 1);
  renderSelectedPhotos();
});

cardGrid.addEventListener("click", async (event) => {
  if (!ownerUnlocked) {
    return;
  }

  const editButton = event.target.closest("[data-edit-card]");
  const deleteButton = event.target.closest("[data-delete-card]");
  const spotlightButton = event.target.closest("[data-toggle-spotlight]");
  const favoriteButton = event.target.closest("[data-toggle-favorite]");

  if (editButton) {
    setEditMode(editButton.dataset.editCard);
    return;
  }

  if (spotlightButton) {
    const cardId = spotlightButton.dataset.toggleSpotlight;
    cards = cards.map((card) =>
      card.id === cardId ? { ...card, spotlight: !card.spotlight } : card,
    );
    saveCards();
    await upsertSupabaseCard(cards.find((card) => card.id === cardId));
    renderCards();
    return;
  }

  if (favoriteButton) {
    const cardId = favoriteButton.dataset.toggleFavorite;
    cards = cards.map((card) =>
      card.id === cardId ? { ...card, favorite: !card.favorite } : card,
    );
    saveCards();
    await upsertSupabaseCard(cards.find((card) => card.id === cardId));
    renderCards();
    return;
  }

  if (!deleteButton) {
    return;
  }

  const cardId = deleteButton.dataset.deleteCard;
  const card = cards.find((entry) => entry.id === cardId);

  if (!card) {
    return;
  }

  const confirmed = window.confirm(`Delete ${card.player} from your collection?`);

  if (!confirmed) {
    return;
  }

  cards = cards.filter((entry) => entry.id !== cardId);

  if (editingCardId === cardId) {
    addCardForm.reset();
    clearSelectedPhotos();
    resetEditMode();
  }

  saveCards();
  await deleteSupabaseCard(cardId);
  renderCards();
});

ownerLoginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const passcode = new FormData(ownerLoginForm).get("passcode");

  if (passcode !== ownerPasscode) {
    loginMessage.textContent = "Wrong passcode.";
    return;
  }

  ownerUnlocked = true;
  sessionStorage.setItem(ownerSessionKey, "true");
  ownerLoginForm.reset();
  renderOwnerState();
});

lockOwnerTools.addEventListener("click", () => {
  ownerUnlocked = false;
  sessionStorage.removeItem(ownerSessionKey);
  addCardForm.reset();
  clearSelectedPhotos();
  stopCamera();
  resetEditMode();
  resetPostForm();
  renderOwnerState();
});

cancelEdit.addEventListener("click", () => {
  addCardForm.reset();
  clearSelectedPhotos();
  stopCamera();
  resetEditMode();
});

postGrid.addEventListener("click", async (event) => {
  if (!ownerUnlocked) {
    return;
  }

  const editButton = event.target.closest("[data-edit-post]");
  const deleteButton = event.target.closest("[data-delete-post]");

  if (editButton) {
    const post = posts.find((entry) => entry.id === editButton.dataset.editPost);

    if (!post) {
      return;
    }

    editingPostId = post.id;
    postForm.elements.namedItem("type").value = post.type;
    postForm.elements.namedItem("title").value = post.title;
    postForm.elements.namedItem("body").value = post.body;
    savePostButton.textContent = "Save Post";
    cancelPostEdit.hidden = false;
    history.pushState(null, "", "#add-card");
    showView("add-card");
    return;
  }

  if (!deleteButton) {
    return;
  }

  const post = posts.find((entry) => entry.id === deleteButton.dataset.deletePost);

  if (!post || !window.confirm(`Delete this post: ${post.title}?`)) {
    return;
  }

  posts = posts.filter((entry) => entry.id !== post.id);
  savePosts();
  await deleteSupabasePost(post.id);
  resetPostForm();
  renderPosts();
});

postForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!ownerUnlocked) {
    return;
  }

  const formData = new FormData(postForm);
  const post = {
    id: editingPostId || createCardId(),
    type: formData.get("type"),
    title: formData.get("title").trim(),
    body: formData.get("body").trim(),
    date: editingPostId
      ? posts.find((entry) => entry.id === editingPostId)?.date || new Date().toISOString()
      : new Date().toISOString(),
  };

  if (editingPostId) {
    posts = posts.map((entry) => (entry.id === editingPostId ? post : entry));
  } else {
    posts = [post, ...posts];
  }

  if (!savePosts()) {
    return;
  }

  await upsertSupabasePost(post);
  resetPostForm();
  renderPosts();
  history.pushState(null, "", "#posts");
  showView("posts");
});

cancelPostEdit.addEventListener("click", resetPostForm);

[brightnessControl, cropXControl, cropYControl, cropWidthControl, cropHeightControl].forEach((control) => {
  control.addEventListener("input", drawEditor);
});

rotateLeft.addEventListener("click", () => {
  editorRotation = (editorRotation - 90 + 360) % 360;
  drawEditor();
});

rotateRight.addEventListener("click", () => {
  editorRotation = (editorRotation + 90) % 360;
  drawEditor();
});

applyPhotoEdits.addEventListener("click", () => {
  if (!editorImage) {
    return;
  }

  drawEditor();
  selectedPhotos.push(photoEditorCanvas.toDataURL("image/jpeg", 0.78));
  editorImage = null;
  photoEditor.hidden = true;
  renderSelectedPhotos();
  openNextPendingPhoto().catch(() => {
    window.alert("The next photo could not be opened in the editor.");
  });
});

async function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
  }

  cameraStream = null;
  cameraVideo.srcObject = null;
  cameraPanel.hidden = true;
}

openCamera.addEventListener("click", async () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    window.alert("This browser cannot open the camera here. Use the photo upload field instead.");
    return;
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });
    cameraVideo.srcObject = cameraStream;
    cameraPanel.hidden = false;
  } catch {
    window.alert("Camera access was blocked or is unavailable. Use the photo upload field instead.");
  }
});

capturePhoto.addEventListener("click", () => {
  if (!cameraVideo.videoWidth || !cameraVideo.videoHeight) {
    return;
  }

  const canvas = document.createElement("canvas");
  const maxSize = 900;
  const scale = Math.min(1, maxSize / Math.max(cameraVideo.videoWidth, cameraVideo.videoHeight));
  canvas.width = Math.round(cameraVideo.videoWidth * scale);
  canvas.height = Math.round(cameraVideo.videoHeight * scale);

  const context = canvas.getContext("2d");
  context.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);
  openPhotoEditor(canvas.toDataURL("image/jpeg", 0.78)).catch(() => {
    window.alert("That photo could not be opened in the editor.");
  });
  stopCamera();
});

closeCamera.addEventListener("click", stopCamera);

addCardForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!ownerUnlocked) {
    return;
  }

  if (editorImage) {
    drawEditor();
    selectedPhotos.push(photoEditorCanvas.toDataURL("image/jpeg", 0.78));
    editorImage = null;
  }

  const formData = new FormData(addCardForm);
  const urlPhoto = formData.get("image").trim();
  const cardImages = [...selectedPhotos];

  if (urlPhoto) {
    cardImages.push(urlPhoto);
  }

  const newCard = {
    id: editingCardId || createCardId(),
    player: formData.get("player").trim(),
    team: formData.get("team").trim(),
    sport: formData.get("sport"),
    type: formData.get("type"),
    year: Number(formData.get("year")),
    set: formData.get("set").trim(),
    grade: formData.get("grade").trim() || "Raw",
    value: Number(formData.get("value")) || 0,
    printRun: formData.get("printRun").trim(),
    variation: formData.get("variation").trim() || "Base",
    image: cardImages[0] || fallbackImage(formData.get("sport")),
    images: cardImages.length ? cardImages : [fallbackImage(formData.get("sport"))],
    favorite: formData.get("favorite") === "on",
    spotlight: formData.get("spotlight") === "on",
  };

  const previousCards = cards.slice();

  if (editingCardId) {
    cards = cards.map((card) => (card.id === editingCardId ? newCard : card));
  } else {
    cards = [newCard, ...cards];
  }

  if (!saveCards()) {
    cards = previousCards;
    return;
  }

  const savedToSupabase = await upsertSupabaseCard(newCard);

  if (!savedToSupabase) {
    cards = previousCards;
    saveCards();
    return;
  }

  addCardForm.reset();
  clearSelectedPhotos();
  stopCamera();
  resetEditMode();
  renderCards();
  history.pushState(null, "", "#collection");
  showView("collection");
});

resetCards.addEventListener("click", () => {
  cards = demoCards.map(normalizeCard);
  saveCards();
  addCardForm.reset();
  clearSelectedPhotos();
  resetEditMode();
  resetPostForm();
  renderCards();
});

[searchInput, sportFilter, typeFilter, sortSelect].forEach((control) => {
  control.addEventListener("input", renderCards);
});

renderOwnerState();
showView(getViewFromHash());
loadSupabaseData();
