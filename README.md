# World Simulator

Symulator świata z zaawansowaną fizyką i interakcjami między stworami.

## Architektura

### Główne komponenty:

1. **index.html** - Strona główna z canvas i kontrolkami
2. **main.js** - Główny wątek UI obsługujący:
   - Komunikację z web workerem
   - Renderowanie na canvas
   - Obsługę zdarzeń użytkownika

3. **worker.js** - Web worker obsługujący:
   - Ciężkie obliczenia symulacji
   - Logikę świata i stworzeń
   - Komunikacja z głównym wątkiem

4. **classes.js** - Definicje klas:
   - `Creature` - reprezentuje pojedyncze stworzenie
   - `World` - reprezentuje cały świat

## Komunikacja Web Worker

### Wiadomości do workera:
- `init` - Inicjalizuj świat
- `start` - Uruchom symulację
- `pause` - Wstrzymaj symulację
- `reset` - Zresetuj świat
- `update` - Aktualizuj świat
- `addCreature` - Dodaj stworzenie
- `setSimulationSpeed` - Ustaw szybkość

### Wiadomości od workera:
- `worldUpdate` - Zaktualizowane dane świata
- `worldState` - Aktualny stan świata

## Uruchomienie

1. Otwórz `index.html` w przeglądarce (wymagany lokalny serwer HTTP)
2. Kliknij "Start" aby uruchomić symulację
3. Kliknij "Pause" aby wstrzymać
4. Kliknij "Reset" aby zresetować

## Następne kroki

W kolejnych iteracjach będziemy dodawać:
- Atrybuty do klasy `Creature` (energia, prędkość, rozmiar, itp.)
- Atrybuty do klasy `World` (temperatura, zasoby, itp.)
- Interakcje między stworami (walka, rozmnażanie, itp.)
- Fizykę (ruch, kolizje, itp.)
