# sKANnA (KANA school)

Un'applicazione web moderna, reattiva e dal design accattivante per imparare gli alfabeti giapponesi **Hiragana** e **Katakana** attraverso quiz intelligenti, ripetizione spaziata e scorciatoie da tastiera.

## 🚀 Funzionalità Principali

### 📊 Selezione Dinamica dei Caratteri
- **Tabelle affiancate**: Selezione intuitiva tramite righe selezionabili per Hiragana e Katakana con i romaji corrispondenti mostrati sotto ogni carattere.
- **Seleziona Tutto**: Checkbox dedicate nelle intestazioni di ciascuna tabella per selezionare o deselezionare istantaneamente l'intero alfabeto Hiragana o Katakana.
- **Persistenza della Selezione**: La configurazione dei gruppi selezionati viene salvata automaticamente in tempo reale nel browser (`localStorage`) e ripristinata fedelmente ad ogni ricarica della pagina.
- **Conteggio in Tempo Reale**: Il numero totale di caratteri selezionati e la suddivisione (es. `Selezionati: 10 caratteri (5 Hiragana, 5 Katakana)`) viene mostrato:
  - In evidenza al fondo delle tabelle di selezione.
  - In piccolo alla base della scheda durante lo svolgimento del quiz.

### 🧠 Algoritmo di Apprendimento Intelligente (Spaced Repetition)
- **Frequenza di Errore**: L'app tiene traccia delle risposte corrette ed errate per ciascun carattere, salvandole in modo persistente in `localStorage`.
- **Estrazione Pesata**: Vengono proposti più frequentemente i caratteri nuovi (mai visti) o quelli che l'utente sbaglia più spesso, riducendo progressivamente la frequenza per i caratteri già assimilati.
- **Nessuna Ripetizione Consecutiva**: L'algoritmo garantisce che non venga mai proposto lo stesso carattere o lo stesso suono (romaji) per due turni di fila per evitare monotonia e risposte automatiche.

---

## 🎮 Modalità di Quiz

L'avvio del quiz avviene direttamente selezionando una delle quattro modalità disponibili al fondo della pagina di configurazione:

1. **Singoli: Kana → Romaji**
   - Viene mostrato un singolo carattere Kana (Hiragana o Katakana).
   - L'utente inserisce la traslitterazione in Romaji nell'input di testo.
2. **Singoli: Romaji → Kana**
   - Viene mostrato un suono in Romaji.
   - Quiz a scelta multipla con griglia 2x2 contenente 4 opzioni in Kana.
3. **Frasi: Kana → Romaji**
   - Genera sequenze/parole casuali da 2 a 5 caratteri composte interamente dallo script selezionato.
   - L'utente digita la corrispondente stringa in Romaji.
4. **Frasi: Romaji → Kana (con convertitore IME integrato)**
   - Genera sequenze casuali in Romaji.
   - L'utente risponde inserendo i caratteri Kana.
   - **Conversione in tempo reale**: L'input di testo converte automaticamente e all'istante i tasti premuti in romaji nel corrispondente carattere Kana (es. digitando `k` `a` `k` `i` l'input mostrerà visivamente `かき`).

---

## ⌨️ Scorciatoie da Tastiera (Shortcut)

Per rendere lo studio rapido ed efficiente, l'applicazione integra comandi rapidi da tastiera:

- **Spazio / Invio**: Invia e verifica la risposta nelle modalità di scrittura (evita di dover cliccare su "Verifica").
- **Escape (ESC)**: Equivale a "Non ricordo" — mostra la soluzione corretta evidenziandola in giallo e mette a fuoco l'input di testo per costringere a scriverla per memorizzazione.
- **Tasti 1, 2, 3, 4**: Nelle modalità a scelta multipla (Romaji → Kana), consentono di selezionare istantaneamente una delle quattro opzioni sulla griglia senza usare il mouse.

---

## 🎨 Design & Estetica
L'applicazione è progettata seguendo una palette di colori moderna ed elegante (ispirata al tema scuro Catppuccin):
- **Hiragana**: Accenti e selezioni nei toni del rosa/pastello.
- **Katakana**: Accenti e selezioni nei toni dell'azzurro/pastello.
- **Feedback visivo**: Segnalazione immediata delle risposte con colorazioni soft e intuitive (verde per le risposte corrette, rosso per gli errori).
