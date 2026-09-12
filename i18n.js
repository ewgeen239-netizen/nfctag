// Each entry: Russian source -> Polish, English, German. Add languages here and in languages below.
const translations = {
  "Кабинет временно недоступен. Попробуй позже.": ["Konto jest chwilowo niedostępne. Spróbuj później.", "Your account is temporarily unavailable. Please try again later.", "Das Konto ist vorübergehend nicht verfügbar. Versuche es später erneut."],
  "NFC — всё о тебе по касанию": [
    "NFC — wszystko o Tobie jednym dotknięciem",
    "NFC — all about you with one tap",
    "NFC — alles über dich mit einem Tap",
  ],
  "NFC, главная": ["NFC, strona główna", "NFC, home", "NFC, Startseite"],
  "Основная навигация": [
    "Nawigacja główna",
    "Main navigation",
    "Hauptnavigation",
  ],
  "Как это работает": ["Jak to działa", "How it works", "So funktioniert’s"],
  "Дизайн карт": ["Wzory kart", "Card designs", "Kartendesigns"],
  "Моя визитка ↗": ["Moja wizytówka ↗", "My card ↗", "Meine Karte ↗"],
  "ТВОЙ МИР. ОДНО КАСАНИЕ.": [
    "TWÓJ ŚWIAT. JEDNO DOTKNIĘCIE.",
    "YOUR WORLD. ONE TAP.",
    "DEINE WELT. EIN TAP.",
  ],
  "Тебя сложно": ["Trudno Cię", "Hard to", "Dich zu erklären"],
  "описать.": ["opisać.", "describe.", "ist schwer."],
  "Легко показать.": ["Łatwo pokazać.", "Easy to show.", "Zeigen ist leicht."],
  "Твой стиль — на карте.": [
    "Twój styl — na karcie.",
    "Your style — on a card.",
    "Dein Stil — auf einer Karte.",
  ],
  "Всё о тебе — по касанию.": [
    "Wszystko o Tobie — jednym dotknięciem.",
    "All about you — with one tap.",
    "Alles über dich — mit einem Tap.",
  ],
  "Создать свою карту": [
    "Stwórz swoją kartę",
    "Create your card",
    "Karte erstellen",
  ],
  "▷   Посмотреть пример": [
    "▷   Zobacz przykład",
    "▷   See an example",
    "▷   Beispiel ansehen",
  ],
  "Белая NFC-карта с лаймовым и сиреневым принтом рядом с телефоном, на котором открыта визитка Александра":
    [
      "Biała karta NFC z limonkowym i liliowym nadrukiem obok telefonu z wizytówką Aleksandra",
      "White NFC card with lime and lilac print beside a phone displaying Alexander’s profile",
      "Weiße NFC-Karte mit limettenfarbenem und fliederfarbenem Druck neben einem Handy mit Alexanders Profil",
    ],
  "Физическая карта.": ["Fizyczna karta.", "Physical card.", "Echte Karte."],
  "Цифровой ты.": ["Cyfrowy Ty.", "Digital you.", "Digitales Ich."],
  "01 / ПРИЛОЖИ": ["01 / ZBLIŻ", "01 / TAP", "01 / ANTIPPEN"],
  "02 / ОТКРОЙ": ["02 / OTWÓRZ", "02 / OPEN", "02 / ÖFFNEN"],
  "03 / ПОЗНАКОМЬСЯ": ["03 / POZNAJ", "03 / CONNECT", "03 / KENNENLERNEN"],
  "Больше, чем визитка": [
    "Więcej niż wizytówka",
    "More than a business card",
    "Mehr als eine Visitenkarte",
  ],
  "Одно знакомство —": [
    "Jedno spotkanie —",
    "One connection —",
    "Eine Begegnung —",
  ],
  "больше возможностей.": [
    "więcej możliwości.",
    "more possibilities.",
    "mehr Möglichkeiten.",
  ],
  "Профессия, навыки и контакты — на одной странице.": [
    "Zawód, umiejętności i kontakty — na jednej stronie.",
    "Your work, skills and contacts — on one page.",
    "Beruf, Fähigkeiten und Kontakte — auf einer Seite.",
  ],
  "Расскажи о себе": ["Opowiedz o sobie", "Tell your story", "Erzähl von dir"],
  "Покажи, кто ты, чем занимаешься и что тебя вдохновляет.": [
    "Pokaż, kim jesteś, co robisz i co Cię inspiruje.",
    "Show who you are, what you do and what inspires you.",
    "Zeig, wer du bist, was du machst und was dich inspiriert.",
  ],
  "Подчеркни навыки": [
    "Pokaż umiejętności",
    "Show your skills",
    "Zeig dein Können",
  ],
  "Твои сильные стороны, профессия и открытость к новым проектам.": [
    "Twoje mocne strony, zawód i otwartość na nowe projekty.",
    "Your strengths, profession and openness to new projects.",
    "Deine Stärken, dein Beruf und deine Offenheit für neue Projekte.",
  ],
  "Оставь контакты": [
    "Udostępnij kontakt",
    "Share your contacts",
    "Teile deine Kontakte",
  ],
  "Соцсети, телефон и портфолио. Всё рядом, ничего не потеряется.": [
    "Social media, telefon i portfolio. Wszystko razem, nic nie zginie.",
    "Socials, phone and portfolio. All together, nothing gets lost.",
    "Social Media, Telefon und Portfolio. Alles zusammen, nichts geht verloren.",
  ],
  Запомнись: ["Daj się zapamiętać", "Be remembered", "Bleib in Erinnerung"],
  "Карта с твоим характером. Вместо очередного номера в телефоне.": [
    "Karta z Twoim charakterem. Zamiast kolejnego numeru w telefonie.",
    "A card with your personality. More than another number in a phone.",
    "Eine Karte mit deinem Charakter. Mehr als eine weitere Nummer im Handy.",
  ],
  "КАК ЭТО РАБОТАЕТ": ["JAK TO DZIAŁA", "HOW IT WORKS", "SO FUNKTIONIERT’S"],
  "Касание.": ["Jedno dotknięcie.", "One tap.", "Ein Tap."],
  "И вы уже знакомы.": [
    "I już się znacie.",
    "And you’re connected.",
    "Und ihr kennt euch.",
  ],
  "Поднеси карту к NFC-зоне совместимого телефона. Открой уведомление — появится твоя визитка.":
    [
      "Zbliż kartę do strefy NFC kompatybilnego telefonu. Otwórz powiadomienie, aby zobaczyć wizytówkę.",
      "Hold your card near the NFC area of a compatible phone. Open the notification to view your profile.",
      "Halte die Karte an den NFC-Bereich eines kompatiblen Handys. Öffne die Benachrichtigung, um dein Profil zu sehen.",
    ],
  "Попробовать касание ↗": [
    "Wypróbuj dotknięcie ↗",
    "Try a tap ↗",
    "Tap ausprobieren ↗",
  ],
  "Интерактивная демонстрация, не видео.": [
    "Interaktywna demonstracja, nie film.",
    "Interactive demonstration, not a video.",
    "Interaktive Demo, kein Video.",
  ],
  БОЛЬШЕ: ["WIĘCEJ", "MORE", "MEHR"],
  ИДЕЙ: ["POMYSŁÓW", "IDEAS", "IDEEN"],
  "НА ЛЮДЯХ": ["WŚRÓD LUDZI", "WITH PEOPLE", "UNTER MENSCHEN"],
  "Твоё имя": ["Twoje imię", "Your name", "Dein Name"],
  "Поднеси карту": ["Zbliż kartę", "Hold your card near", "Karte annähern"],
  "NFC-карта обнаружена": [
    "Wykryto kartę NFC",
    "NFC card detected",
    "NFC-Karte erkannt",
  ],
  "Открываем пример визитки…": [
    "Otwieramy przykładową wizytówkę…",
    "Opening the sample profile…",
    "Beispielprofil wird geöffnet…",
  ],
  "Визитка открыта ✓": [
    "Wizytówka otwarta ✓",
    "Profile opened ✓",
    "Profil geöffnet ✓",
  ],
  "Готово. Так выглядит знакомство по касанию.": [
    "Gotowe. Tak wygląda poznawanie przez dotknięcie.",
    "Done. That’s how a tap starts a connection.",
    "Fertig. So beginnt eine Begegnung mit einem Tap.",
  ],
  "МАЛЕНЬКАЯ КАРТА. БОЛЬШОЙ ХАРАКТЕР.": [
    "MAŁA KARTA. WIELKI CHARAKTER.",
    "SMALL CARD. BIG PERSONALITY.",
    "KLEINE KARTE. GROSSER CHARAKTER.",
  ],
  "Твой стиль.": ["Twój styl.", "Your style.", "Dein Stil."],
  "В реальном мире.": [
    "W prawdziwym świecie.",
    "In the real world.",
    "In der echten Welt.",
  ],
  "ЧЕМ ИМЯ.": ["NIŻ IMIĘ.", "THAN A NAME.", "ALS EIN NAME."],
  Лайм: ["Limonka", "Lime", "Limette"],
  Сирень: ["Lila", "Lilac", "Flieder"],
  Моно: ["Mono", "Mono", "Mono"],
  "01 / Выбран": ["01 / Wybrano", "01 / Selected", "01 / Ausgewählt"],
  "01 / Выбрать": ["01 / Wybierz", "01 / Select", "01 / Auswählen"],
  "02 / Выбран": ["02 / Wybrano", "02 / Selected", "02 / Ausgewählt"],
  "02 / Выбрать": ["02 / Wybierz", "02 / Select", "02 / Auswählen"],
  "03 / Выбран": ["03 / Wybrano", "03 / Selected", "03 / Ausgewählt"],
  "03 / Выбрать": ["03 / Wybierz", "03 / Select", "03 / Auswählen"],
  "Готовый шаблон с персонализацией или уникальный дизайн по запросу. Авторский знак сохраняется; в прототипе его место условное.":
    [
      "Gotowy szablon z personalizacją lub unikalny projekt na zamówienie. Znak autora pozostaje; w prototypie jest umowny.",
      "Personalize a template or request a unique design. The creator’s mark stays; its placement in this prototype is provisional.",
      "Personalisiere eine Vorlage oder frage ein eigenes Design an. Das Urheberzeichen bleibt; im Prototyp ist es vorläufig.",
    ],
  "Персонализировать ↗": [
    "Personalizuj ↗",
    "Personalize ↗",
    "Personalisieren ↗",
  ],
  "От идеи": ["Od pomysłu", "From an idea", "Von der Idee"],
  "до первого касания.": [
    "do pierwszego dotknięcia.",
    "to the first tap.",
    "zum ersten Tap.",
  ],
  "Создай визитку": [
    "Stwórz wizytówkę",
    "Create your profile",
    "Erstelle dein Profil",
  ],
  "Добавь фото, профессию, навыки и контакты.": [
    "Dodaj zdjęcie, zawód, umiejętności i kontakty.",
    "Add your photo, profession, skills and contacts.",
    "Füge Foto, Beruf, Fähigkeiten und Kontakte hinzu.",
  ],
  "Согласуй дизайн": [
    "Zatwierdź projekt",
    "Approve your design",
    "Stimme dein Design ab",
  ],
  "Выбери шаблон или опиши свою идею. Макет согласовывается перед изготовлением.":
    [
      "Wybierz szablon lub opisz swój pomysł. Projekt zatwierdzasz przed produkcją.",
      "Choose a template or describe your idea. Approve the design before production.",
      "Wähle eine Vorlage oder beschreibe deine Idee. Das Design wird vor der Herstellung abgestimmt.",
    ],
  "Получи свою карту": [
    "Odbierz kartę",
    "Get your card",
    "Erhalte deine Karte",
  ],
  "NTAG216. Изготовление ориентировочно 1–2 недели, затем отправка.": [
    "NTAG216. Produkcja trwa około 1–2 tygodni, potem wysyłka.",
    "NTAG216. Production takes approximately 1–2 weeks, followed by shipping.",
    "NTAG216. Herstellung voraussichtlich 1–2 Wochen, anschließend Versand.",
  ],
  "Ещё пару вещей.": [
    "Jeszcze kilka rzeczy.",
    "A few more things.",
    "Noch ein paar Dinge.",
  ],
  "Что записано на карте?": [
    "Co jest zapisane na karcie?",
    "What’s stored on the card?",
    "Was ist auf der Karte gespeichert?",
  ],
  "Постоянная ссылка на публичную мобильную визитку. После запуска сервиса содержимое можно будет менять в кабинете без замены карты. Сейчас доступен локальный прототип.":
    [
      "Stały link do publicznej wizytówki mobilnej. Po uruchomieniu usługi treść będzie można zmieniać w panelu bez wymiany karty. Teraz dostępny jest lokalny prototyp.",
      "A permanent link to your public mobile profile. Once the service launches, you’ll edit its content in your account without replacing the card. This is currently a local prototype.",
      "Ein dauerhafter Link zu deinem öffentlichen mobilen Profil. Nach dem Start kannst du Inhalte im Konto ändern, ohne die Karte zu ersetzen. Derzeit ist dies ein lokaler Prototyp.",
    ],
  "Нужно устанавливать приложение?": [
    "Czy trzeba instalować aplikację?",
    "Do I need an app?",
    "Brauche ich eine App?",
  ],
  "Для просмотра визитки достаточно браузера и интернета. Чтение карты зависит от поддержки NFC и настроек телефона.":
    [
      "Do wyświetlenia wizytówki wystarczy przeglądarka i internet. Odczyt karty zależy od obsługi NFC i ustawień telefonu.",
      "Viewing a profile only requires a browser and internet. Reading the card depends on NFC support and phone settings.",
      "Ein Browser und Internet reichen zur Anzeige. Das Lesen der Karte hängt von NFC-Unterstützung und Handyeinstellungen ab.",
    ],
  "Можно уже заказать?": [
    "Czy można już zamówić?",
    "Can I order now?",
    "Kann ich schon bestellen?",
  ],
  "Здесь можно выбрать дизайн и сохранить черновик. Регистрация, оплата, реальные заказы и публикация пока не подключены.":
    [
      "Możesz wybrać projekt i zapisać szkic. Rejestracja, płatności, prawdziwe zamówienia i publikacja nie są jeszcze dostępne.",
      "You can choose a design and save a draft. Registration, payments, real orders and publishing are not connected yet.",
      "Du kannst ein Design wählen und einen Entwurf speichern. Registrierung, Zahlungen, echte Bestellungen und Veröffentlichung sind noch nicht verfügbar.",
    ],
  "Хорошие знакомства начинаются с тебя.": [
    "Dobre znajomości zaczynają się od Ciebie.",
    "Good connections start with you.",
    "Gute Begegnungen beginnen mit dir.",
  ],
  "Локальный прототип": [
    "Lokalny prototyp",
    "Local prototype",
    "Lokaler Prototyp",
  ],
  "ТВОЯ ЦИФРОВАЯ ВИЗИТКА": [
    "TWOJA CYFROWA WIZYTÓWKA",
    "YOUR DIGITAL PROFILE",
    "DEINE DIGITALE VISITENKARTE",
  ],
  "Начнём с тебя.": [
    "Zacznijmy od Ciebie.",
    "Let’s start with you.",
    "Fangen wir mit dir an.",
  ],
  "Закрыть редактор": ["Zamknij edytor", "Close editor", "Editor schließen"],
  "Демокабинет без регистрации. Черновик хранится только в этом браузере; заказ и оплата не отправляются.":
    [
      "Panel demo bez rejestracji. Szkic zapisuje się tylko w tej przeglądarce; zamówienia i płatności nie są wysyłane.",
      "Demo account without registration. Your draft stays in this browser only; no order or payment is submitted.",
      "Demokonto ohne Registrierung. Der Entwurf bleibt nur in diesem Browser; keine Bestellung oder Zahlung wird übermittelt.",
    ],
  Имя: ["Imię", "First name", "Vorname"],
  Фамилия: ["Nazwisko", "Last name", "Nachname"],
  Фото: ["Zdjęcie", "Photo", "Foto"],
  "JPG, PNG или WebP, до 2 МБ": [
    "JPG, PNG lub WebP, do 2 MB",
    "JPG, PNG or WebP, up to 2 MB",
    "JPG, PNG oder WebP, bis 2 MB",
  ],
  "О себе": ["O mnie", "About you", "Über dich"],
  Профессия: ["Zawód", "Profession", "Beruf"],
  "Навыки, через запятую": [
    "Umiejętności, oddzielone przecinkami",
    "Skills, separated by commas",
    "Fähigkeiten, durch Kommas getrennt",
  ],
  "Вакансии и проекты": [
    "Praca i projekty",
    "Jobs and projects",
    "Jobs und Projekte",
  ],
  Телефон: ["Telefon", "Phone", "Telefon"],
  "Соцсеть или портфолио": [
    "Social media lub portfolio",
    "Social profile or portfolio",
    "Social Media oder Portfolio",
  ],
  "Дизайн карты": ["Wzór karty", "Card design", "Kartendesign"],
  "Идея для дизайна": ["Pomysł na projekt", "Design idea", "Designidee"],
  "Уникальный дизайн": [
    "Indywidualny projekt",
    "Custom design",
    "Individuelles Design",
  ],
  "Что добавить на карту?": [
    "Co dodać do karty?",
    "What should we add to the card?",
    "Was soll auf die Karte?",
  ],
  "Что тебя вдохновляет?": [
    "Co Cię inspiruje?",
    "What inspires you?",
    "Was inspiriert dich?",
  ],
  Александр: ["Aleksander", "Alexander", "Alexander"],
  Иванов: ["Iwanow", "Ivanov", "Iwanow"],
  Дизайнер: ["Projektant", "Designer", "Designer"],
  "Брендинг, веб-дизайн, UI/UX": [
    "Branding, projektowanie stron, UI/UX",
    "Branding, web design, UI/UX",
    "Branding, Webdesign, UI/UX",
  ],
  "Открыт к проектам и предложениям": [
    "Otwarty na projekty i propozycje",
    "Open to projects and opportunities",
    "Offen für Projekte und Angebote",
  ],
  "Сохранить черновик ↗": [
    "Zapisz szkic ↗",
    "Save draft ↗",
    "Entwurf speichern ↗",
  ],
  Предпросмотр: ["Podgląd", "Preview", "Vorschau"],
  "Очистить черновик": ["Wyczyść szkic", "Clear draft", "Entwurf leeren"],
  "Закрыть пример": ["Zamknij przykład", "Close example", "Beispiel schließen"],
  "Локальный предпросмотр. Публичная ссылка ещё не создана.": [
    "Lokalny podgląd. Publiczny link nie został jeszcze utworzony.",
    "Local preview. No public link has been created yet.",
    "Lokale Vorschau. Noch kein öffentlicher Link erstellt.",
  ],
  "Выбери JPG, PNG или WebP размером до 2 МБ.": [
    "Wybierz JPG, PNG lub WebP do 2 MB.",
    "Choose a JPG, PNG or WebP up to 2 MB.",
    "Wähle JPG, PNG oder WebP bis 2 MB.",
  ],
  "Фото добавлено. Сохрани черновик.": [
    "Zdjęcie dodane. Zapisz szkic.",
    "Photo added. Save your draft.",
    "Foto hinzugefügt. Speichere den Entwurf.",
  ],
  "Не удалось прочитать фото. Попробуй другой файл.": [
    "Nie udało się odczytać zdjęcia. Spróbuj innego pliku.",
    "Could not read the photo. Try another file.",
    "Foto konnte nicht gelesen werden. Versuche eine andere Datei.",
  ],
  "Укажи имя": [
    "Podaj imię",
    "Enter your first name",
    "Gib deinen Vornamen ein",
  ],
  "Черновик сохранён в этом браузере. Заказ не создан.": [
    "Szkic zapisano w tej przeglądarce. Zamówienie nie zostało utworzone.",
    "Draft saved in this browser. No order was created.",
    "Entwurf in diesem Browser gespeichert. Keine Bestellung erstellt.",
  ],
  "Не удалось сохранить: хранилище недоступно или переполнено. Попробуй фото меньшего размера.":
    [
      "Nie udało się zapisać: pamięć niedostępna lub pełna. Spróbuj mniejszego zdjęcia.",
      "Could not save: storage is unavailable or full. Try a smaller photo.",
      "Speichern fehlgeschlagen: Speicher nicht verfügbar oder voll. Versuche ein kleineres Foto.",
    ],
  "Визуальные решения для смелых идей. Люблю знакомиться с людьми, которые создают новое.":
    [
      "Rozwiązania wizualne dla odważnych pomysłów. Lubię poznawać ludzi, którzy tworzą coś nowego.",
      "Visual solutions for bold ideas. I love meeting people who create new things.",
      "Visuelle Lösungen für mutige Ideen. Ich lerne gerne Menschen kennen, die Neues schaffen.",
    ],
  "Веб-дизайн": ["Projektowanie stron", "Web design", "Webdesign"],
  Брендинг: ["Branding", "Branding", "Branding"],
  "Открыт к творческим проектам": [
    "Otwarty na kreatywne projekty",
    "Open to creative projects",
    "Offen für kreative Projekte",
  ],
  "Твоя профессия": ["Twój zawód", "Your profession", "Dein Beruf"],
  "Здесь будет твоя история.": [
    "Tutaj będzie Twoja historia.",
    "Your story goes here.",
    "Hier steht deine Geschichte.",
  ],
  Позвонить: ["Zadzwoń", "Call", "Anrufen"],
  "Соцсеть / портфолио ↗": [
    "Social media / portfolio ↗",
    "Socials / portfolio ↗",
    "Social Media / Portfolio ↗",
  ],
  "Сохранить контакт ↓": [
    "Zapisz kontakt ↓",
    "Save contact ↓",
    "Kontakt speichern ↓",
  ],
  "Черновик очищен.": [
    "Szkic wyczyszczony.",
    "Draft cleared.",
    "Entwurf geleert.",
  ],
  "Хранилище недоступно. Не удалось очистить черновик.": [
    "Pamięć niedostępna. Nie udało się wyczyścić szkicu.",
    "Storage unavailable. Could not clear the draft.",
    "Speicher nicht verfügbar. Entwurf konnte nicht geleert werden.",
  ],
  "Выбор языка": ["Wybór języka", "Choose language", "Sprache wählen"],
  "Все доступные языки": [
    "Wszystkie dostępne języki",
    "All available languages",
    "Alle verfügbaren Sprachen",
  ],
};
Object.assign(translations, {
  "Войти / Личный кабинет": [
    "Zaloguj / Moje konto",
    "Sign in / My account",
    "Anmelden / Mein Konto",
  ],
  "Личный кабинет. Профиль сохраняется на локальном сервере. Оплата и реальные заказы пока не подключены.":
    [
      "Moje konto. Profil jest zapisywany na lokalnym serwerze. Płatności i prawdziwe zamówienia nie są jeszcze dostępne.",
      "My account. Your profile is saved on the local server. Payments and real orders are not connected yet.",
      "Mein Konto. Dein Profil wird auf dem lokalen Server gespeichert. Zahlungen und echte Bestellungen sind noch nicht verfügbar.",
    ],
  "Постоянная ссылка": ["Stały link", "Permanent link", "Dauerhafter Link"],
  "Ссылка закреплена за вашей визиткой. Меняйте дизайн и данные — адрес останется прежним.":
    [
      "Link jest przypisany do Twojej wizytówki. Zmieniaj projekt i dane — adres pozostanie ten sam.",
      "This link belongs to your profile. Change your design and details — the address stays the same.",
      "Dieser Link gehört zu deiner Visitenkarte. Ändere Design und Daten — die Adresse bleibt gleich.",
    ],
  Выйти: ["Wyloguj", "Sign out", "Abmelden"],
  "Копировать ссылку": ["Kopiuj link", "Copy link", "Link kopieren"],
  "Открыть визитку ↗": [
    "Otwórz wizytówkę ↗",
    "Open profile ↗",
    "Profil öffnen ↗",
  ],
  "Этот адрес работает только на данном компьютере. Для записи в NFC-карту нужен публичный HTTPS-адрес. Карта физически не записана.":
    [
      "Ten adres działa tylko na tym komputerze. Do zapisania na karcie NFC potrzebny jest publiczny adres HTTPS. Fizyczna karta nie została zapisana.",
      "This address works only on this computer. Writing an NFC card requires a public HTTPS address. No physical card has been written.",
      "Diese Adresse funktioniert nur auf diesem Computer. Für eine NFC-Karte ist eine öffentliche HTTPS-Adresse nötig. Keine physische Karte wurde beschrieben.",
    ],
  "Сохранить визитку ↗": [
    "Zapisz wizytówkę ↗",
    "Save profile ↗",
    "Profil speichern ↗",
  ],
  "Предпросмотр несохранённых изменений. Сохрани визитку, чтобы обновить постоянную страницу.":
    [
      "Podgląd niezapisanych zmian. Zapisz wizytówkę, aby zaktualizować stałą stronę.",
      "Preview of unsaved changes. Save your profile to update the permanent page.",
      "Vorschau ungespeicherter Änderungen. Speichere dein Profil, um die dauerhafte Seite zu aktualisieren.",
    ],
  "Здесь можно зарегистрироваться, создать визитку и выбрать дизайн. Оплата, реальные заказы и внешняя публикация пока не подключены.":
    [
      "Możesz się zarejestrować, stworzyć wizytówkę i wybrać projekt. Płatności, prawdziwe zamówienia i publikacja online nie są jeszcze dostępne.",
      "You can register, create a profile and choose a design. Payments, real orders and external publishing are not connected yet.",
      "Du kannst dich registrieren, ein Profil erstellen und ein Design wählen. Zahlungen, echte Bestellungen und externe Veröffentlichung sind noch nicht verfügbar.",
    ],
  "Постоянная ссылка на публичную мобильную визитку. Меняй содержимое в личном кабинете: ссылка останется прежней. Для физической NFC-карты сайт необходимо разместить на публичном HTTPS-адресе.":
    [
      "Stały link do publicznej wizytówki mobilnej. Zmieniaj treść na koncie: link pozostanie ten sam. Aby używać fizycznej karty NFC, strona musi mieć publiczny adres HTTPS.",
      "A permanent link to your public mobile profile. Edit your content in your account: the link stays the same. A physical NFC card requires the site to be deployed at a public HTTPS address.",
      "Ein dauerhafter Link zu deinem öffentlichen mobilen Profil. Ändere Inhalte im Konto: Der Link bleibt gleich. Für eine physische NFC-Karte muss die Website unter einer öffentlichen HTTPS-Adresse bereitstehen.",
    ],
  "Войти в кабинет": [
    "Zaloguj się",
    "Sign in to your account",
    "Im Konto anmelden",
  ],
  "Создать аккаунт": ["Utwórz konto", "Create an account", "Konto erstellen"],
  Войти: ["Zaloguj się", "Sign in", "Anmelden"],
  Зарегистрироваться: ["Zarejestruj się", "Register", "Registrieren"],
  "Нет аккаунта? Регистрация": [
    "Nie masz konta? Zarejestruj się",
    "No account? Register",
    "Noch kein Konto? Registrieren",
  ],
  "Уже есть аккаунт? Войти": [
    "Masz już konto? Zaloguj się",
    "Already have an account? Sign in",
    "Schon ein Konto? Anmelden",
  ],
  Закрыть: ["Zamknij", "Close", "Schließen"],
  "Локальный аккаунт. Email используется как логин, письма не отправляются.": [
    "Konto lokalne. Email służy jako login, wiadomości nie są wysyłane.",
    "Local account. Email is used as your login; no emails are sent.",
    "Lokales Konto. Die E-Mail dient als Login; es werden keine E-Mails versendet.",
  ],
  Пароль: ["Hasło", "Password", "Passwort"],
  "От 10 до 128 символов.": [
    "Od 10 do 128 znaków.",
    "10 to 128 characters.",
    "10 bis 128 Zeichen.",
  ],
  "Неверный email или пароль.": [
    "Nieprawidłowy email lub hasło.",
    "Incorrect email or password.",
    "Falsche E-Mail oder falsches Passwort.",
  ],
  "Введи email и пароль от 10 до 128 символов.": [
    "Podaj email i hasło od 10 do 128 znaków.",
    "Enter an email and a password with 10 to 128 characters.",
    "Gib eine E-Mail und ein Passwort mit 10 bis 128 Zeichen ein.",
  ],
  "Этот email уже зарегистрирован.": [
    "Ten email jest już zarejestrowany.",
    "This email is already registered.",
    "Diese E-Mail ist bereits registriert.",
  ],
  "Войди снова, чтобы сохранить изменения.": [
    "Zaloguj się ponownie, aby zapisać zmiany.",
    "Sign in again to save changes.",
    "Melde dich erneut an, um Änderungen zu speichern.",
  ],
  "Проверь поля формы.": [
    "Sprawdź pola formularza.",
    "Check the form fields.",
    "Prüfe die Formularfelder.",
  ],
  "Файл слишком большой.": [
    "Plik jest za duży.",
    "The file is too large.",
    "Die Datei ist zu groß.",
  ],
  "Запрос отклонён. Обнови страницу.": [
    "Żądanie odrzucone. Odśwież stronę.",
    "Request rejected. Refresh the page.",
    "Anfrage abgelehnt. Lade die Seite neu.",
  ],
  "Не удалось выполнить запрос. Проверь соединение и попробуй снова.": [
    "Nie udało się wykonać żądania. Sprawdź połączenie i spróbuj ponownie.",
    "Request failed. Check your connection and try again.",
    "Anfrage fehlgeschlagen. Prüfe die Verbindung und versuche es erneut.",
  ],
  "Подождите…": ["Proszę czekać…", "Please wait…", "Bitte warten…"],
  "Ссылка скопирована.": ["Link skopiowany.", "Link copied.", "Link kopiert."],
  "Выделенная ссылка готова к копированию.": [
    "Zaznaczony link jest gotowy do skopiowania.",
    "The selected link is ready to copy.",
    "Der markierte Link kann kopiert werden.",
  ],
  "Сохраняем…": ["Zapisywanie…", "Saving…", "Wird gespeichert…"],
  "Визитка сохранена на сервере. Постоянная ссылка обновлена.": [
    "Wizytówka zapisana na serwerze. Treść pod stałym linkiem została zaktualizowana.",
    "Profile saved on the server. Content at your permanent link has been updated.",
    "Profil auf dem Server gespeichert. Der Inhalt unter deinem dauerhaften Link wurde aktualisiert.",
  ],
  "Публичная визитка · NFC": [
    "Publiczna wizytówka · NFC",
    "Public profile · NFC",
    "Öffentliche Visitenkarte · NFC",
  ],
  "Визитка не найдена или сервер недоступен.": [
    "Nie znaleziono wizytówki lub serwer jest niedostępny.",
    "Profile not found or server unavailable.",
    "Profil nicht gefunden oder Server nicht verfügbar.",
  ],
  "Фото профиля": ["Zdjęcie profilowe", "Profile photo", "Profilfoto"],
});
Object.assign(translations, {
  "Личный кабинет": ["Moje konto", "My account", "Mein Konto"],
  "Всё готово": ["Wszystko gotowe", "All set", "Alles fertig"],
  "Твоя визитка обновлена. Можно знакомиться.": [
    "Twoja wizytówka jest aktualna. Czas poznawać ludzi.",
    "Your profile is updated. Time to connect.",
    "Deine Visitenkarte ist aktualisiert. Zeit für neue Kontakte.",
  ],
  "Перейти в личный кабинет": [
    "Przejdź do konta",
    "Go to my account",
    "Zum persönlichen Konto",
  ],
  "Мобильный предпросмотр": [
    "Podgląd mobilny",
    "Mobile preview",
    "Mobile Vorschau",
  ],
  "Расскажи, чем занимаешься и с чем к тебе обращаться.": [
    "Opisz, czym się zajmujesz i w czym możesz pomóc.",
    "Describe what you do and how you can help.",
    "Beschreibe, was du machst und wobei du helfen kannst.",
  ],
  "Услуги и предложения": [
    "Usługi i oferta",
    "Services and offers",
    "Leistungen und Angebote",
  ],
  "Какие задачи ты помогаешь решать?": [
    "Jakie zadania pomagasz rozwiązać?",
    "What problems do you help solve?",
    "Bei welchen Aufgaben hilfst du?",
  ],
  "Номер с кодом страны": [
    "Numer z kodem kraju",
    "Number including country code",
    "Nummer mit Ländervorwahl",
  ],
  "Контактный email": ["Email kontaktowy", "Contact email", "Kontakt-E-Mail"],
  "Акцент цифровой визитки": [
    "Akcent wizytówki cyfrowej",
    "Digital profile accent",
    "Akzent der digitalen Visitenkarte",
  ],
  Серебро: ["Srebro", "Silver", "Silber"],
  "Единый стиль, твой цветовой акцент": [
    "Wspólny styl, Twój akcent kolorystyczny",
    "One shared style, your color accent",
    "Ein gemeinsamer Stil, dein Farbakzent",
  ],
  "Фото добавлено. Сохрани визитку.": [
    "Zdjęcie dodane. Zapisz wizytówkę.",
    "Photo added. Save your profile.",
    "Foto hinzugefügt. Speichere deine Visitenkarte.",
  ],
  "Обо мне": ["O mnie", "About me", "Über mich"],
  Навыки: ["Umiejętności", "Skills", "Fähigkeiten"],
  Связаться: ["Kontakt", "Get in touch", "Kontakt aufnehmen"],
  "Сайт / портфолио": [
    "Strona / portfolio",
    "Website / portfolio",
    "Website / Portfolio",
  ],
  "Сохранить контакт": ["Zapisz kontakt", "Save contact", "Kontakt speichern"],
  "Проверь ссылки Instagram и Telegram, email и номер WhatsApp с кодом страны.":
    [
      "Sprawdź linki do Instagram i Telegram, email oraz numer WhatsApp z kodem kraju.",
      "Check your Instagram and Telegram links, email, and WhatsApp number with country code.",
      "Prüfe Instagram- und Telegram-Links, E-Mail und WhatsApp-Nummer mit Ländervorwahl.",
    ],
});
Object.assign(translations, {
  "3D-демонстрация: руки подносят NFC-карту к телефону, касаются уведомления и открывают визитку.":
    [
      "Demonstracja 3D: dłonie zbliżają kartę NFC do telefonu, dotykają powiadomienia i otwierają wizytówkę.",
      "3D demonstration: hands bring an NFC card to a phone, tap the notification and open a profile.",
      "3D-Demo: Hände halten eine NFC-Karte ans Handy, tippen auf die Benachrichtigung und öffnen ein Profil.",
    ],
  "3D-демонстрация": ["Demonstracja 3D", "3D demonstration", "3D-Demo"],
  Пауза: ["Pauza", "Pause", "Pause"],
  Продолжить: ["Kontynuuj", "Resume", "Fortsetzen"],
  Воспроизвести: ["Odtwórz", "Play", "Abspielen"],
  "Открой уведомление": [
    "Otwórz powiadomienie",
    "Open the notification",
    "Benachrichtigung öffnen",
  ],
  "Коснись ссылки": ["Dotknij linku", "Tap the link", "Link antippen"],
  "Твоя визитка открыта": [
    "Twoja wizytówka jest otwarta",
    "Your profile is open",
    "Dein Profil ist geöffnet",
  ],
  "Открыть визитку": ["Otwórz wizytówkę", "Open profile", "Profil öffnen"],
  "Демо-ссылка": ["Link demonstracyjny", "Demo link", "Demo-Link"],
  "Визуальные решения для смелых идей.": [
    "Rozwiązania wizualne dla odważnych pomysłów.",
    "Visual solutions for bold ideas.",
    "Visuelle Lösungen für mutige Ideen.",
  ],
  "3D недоступно. Посмотри интерактивный пример визитки.": [
    "3D jest niedostępne. Zobacz interaktywny przykład wizytówki.",
    "3D is unavailable. View the interactive profile example.",
    "3D ist nicht verfügbar. Sieh dir das interaktive Profilbeispiel an.",
  ],
});
Object.assign(translations, {
  "Расскажи о себе и добавь контакты, которыми хочешь поделиться.": [
    "Opowiedz o sobie i dodaj kontakty, którymi chcesz się dzielić.",
    "Tell your story and add the contacts you want to share.",
    "Erzähl von dir und füge die Kontakte hinzu, die du teilen möchtest.",
  ],
  "Войди, чтобы продолжить работу над своей визиткой.": [
    "Zaloguj się, aby kontynuować pracę nad wizytówką.",
    "Sign in to continue working on your profile.",
    "Melde dich an, um deine Visitenkarte weiterzubearbeiten.",
  ],
  "Твой мир. Одно касание.": [
    "Twój świat. Jedno dotknięcie.",
    "Your world. One tap.",
    "Deine Welt. Ein Tap.",
  ],
  "Как выбрать оформление карты?": [
    "Jak wybrać wygląd karty?",
    "How do I choose a card design?",
    "Wie wähle ich ein Kartendesign?",
  ],
  "Выбери шаблон и сохрани идею оформления в кабинете. Перед изготовлением макет нужно согласовать.":
    [
      "Wybierz szablon i zapisz pomysł na koncie. Przed produkcją projekt wymaga zatwierdzenia.",
      "Choose a template and save your design idea in your account. The design needs approval before production.",
      "Wähle eine Vorlage und speichere deine Idee im Konto. Vor der Herstellung muss das Design abgestimmt werden.",
    ],
  "Постоянная ссылка на твою визитку. Меняй данные в личном кабинете — адрес останется прежним.":
    [
      "Stały link do Twojej wizytówki. Zmieniaj dane na koncie — adres pozostanie ten sam.",
      "A permanent link to your profile. Edit your details in your account — the address stays the same.",
      "Ein dauerhafter Link zu deiner Visitenkarte. Ändere deine Daten im Konto — die Adresse bleibt gleich.",
    ],
  "Готовый шаблон с персонализацией или твоя уникальная идея. Сохрани пожелания к оформлению в кабинете.":
    [
      "Gotowy szablon z personalizacją lub Twój własny pomysł. Zapisz preferencje projektu na koncie.",
      "A personalized template or your own idea. Save your design preferences in your account.",
      "Eine personalisierte Vorlage oder deine eigene Idee. Speichere deine Designwünsche im Konto.",
    ],
  "Попробуй, как работает касание.": [
    "Sprawdź, jak działa dotknięcie.",
    "Try how a tap works.",
    "Probiere aus, wie ein Tap funktioniert.",
  ],
  "Одно касание": ["Jedno dotknięcie", "One tap", "Ein Tap"],
  "Без приложения": ["Bez aplikacji", "No app needed", "Ohne App"],
  "Слишком много попыток. Попробуй через 15 минут.": [
    "Zbyt wiele prób. Spróbuj za 15 minut.",
    "Too many attempts. Try again in 15 minutes.",
    "Zu viele Versuche. Versuche es in 15 Minuten erneut.",
  ],
});
const languages = ["ru", "pl", "en", "de"];
let language = "ru";
try {
  const value = localStorage.getItem("nfc-language");
  if (languages.includes(value)) language = value;
} catch {}
const originalText = new WeakMap(),
  originalAttrs = new WeakMap();
function translate(source) {
  return language === "ru"
    ? source
    : translations[source]?.[languages.indexOf(language) - 1] || source;
}
window.nfcTranslate = translate;
function applyTranslations() {
  observer.disconnect();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let text;
  while ((text = walker.nextNode())) {
    if (
      text.parentElement.closest(
        "script,style,[data-user-content],.language-picker",
      )
    )
      continue;
    const current = text.nodeValue;
    let entry = originalText.get(text);
    if (!entry || current !== entry.rendered) entry = { source: current };
    const trimmed = entry.source.trim();
    entry.rendered = translations[trimmed]
      ? entry.source.replace(trimmed, translate(trimmed))
      : entry.source;
    if (text.nodeValue !== entry.rendered) text.nodeValue = entry.rendered;
    originalText.set(text, entry);
  }
  document
    .querySelectorAll("[placeholder],[aria-label],[alt],option")
    .forEach((el) => {
      for (const attr of ["placeholder", "aria-label", "alt"]) {
        if (!el.hasAttribute(attr)) continue;
        let attrs = originalAttrs.get(el) || {};
        attrs[attr] ??= el.getAttribute(attr);
        el.setAttribute(attr, translate(attrs[attr]));
        originalAttrs.set(el, attrs);
      }
    });
  document.title = translate("NFC — всё о тебе по касанию");
  document.documentElement.lang = language;
  document.querySelectorAll("[data-lang]").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.lang === language));
    b.classList.toggle("active", b.dataset.lang === language);
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}
const observer = new MutationObserver(applyTranslations);
document.querySelectorAll("[data-lang]").forEach(
  (button) =>
    (button.onclick = () => {
      language = button.dataset.lang;
      try {
        localStorage.setItem("nfc-language", language);
      } catch {}
      $(".language-menu").open = false;
      applyTranslations();
      document.dispatchEvent(new Event("nfc-language-change"));
    }),
);
applyTranslations();
