# Brandbook Brightbox

Manuál značky Brightbox a pravidla pro sociální sítě jako statický web.

- `index.html` - manuál značky (značka, logo, skupina, barvy, typografie, grafické prvky, fotografie, aplikace, ke stažení)
- `socialni-site.html` - sociální sítě (principy, plochy, šablony, Instagram, LinkedIn, Facebook, psaní, rozměry)
- `smery.html` - jak se vybíral směr šablon
- `sablony.html` - všech 38 šablon v plné velikosti (`?native` = 1:1 pro export, `?safe` = bezpečné zóny)
- `deck/` - zdroj prezentace pro Figmu a PDF
- `downloads/` - logo (SVG, PNG), PDF manuálu, náhledy šablon, profilová fotka

## Úpravy

Zdroj je v `src/` (stránky a partialy), styly v `assets/css`, skripty v `assets/js`.

```bash
python3 build.py
```

Sestaví stránky do kořene složky včetně české typografie (nezlomitelné mezery po předložkách). Pak stačí libovolný statický server, např. `python3 -m http.server 4373`.

Šablony sítí jsou v `src/partials/templates.html` a `assets/css/tpl.css`. Editovatelné verze jsou ve Figmě.
