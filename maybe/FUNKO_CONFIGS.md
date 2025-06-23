# Funko Pop Transformation Configurations

## ATTEMPT 1 - WINNER (Best Box Packaging)

### Configuration:
```json
{
  "similarity": 0.7,
  "cfg": 7.0,
  "seed": 42,
  "quality": "premium",
  "width": 1024,
  "height": 1024
}
```

### Prompt:
```
Transform into a Funko Pop vinyl figure inside clear plastic packaging box, large oversized head, small body proportions, cute cartoon style, collectible toy figure sitting in retail box packaging, Pop! vinyl collectible, product photography, toy store display
```

### Results:
- ✅ Perfect clear plastic retail packaging box
- ✅ Professional Funko Pop figure inside box
- ✅ Large head, small body proportions
- ✅ Preserved facial features (beard, hair)
- ✅ High-quality collectible presentation
- ✅ Professional product photography style

---

## ATTEMPT 3 - CLASSIC FUNKO STYLE

### Configuration:
```json
{
  "similarity": 0.8,
  "cfg": 9.0,
  "seed": 999,
  "quality": "premium",
  "width": 1024,
  "height": 1024
}
```

### Prompt:
```
Create a Funko Pop vinyl figure inside a clear retail packaging box, large head small body, cartoon proportions, collectible toy in transparent plastic box packaging, retail display box, Pop! figure packaging
```

### Results:
- ✅ Classic Funko Pop black dot eyes
- ✅ Oversized head proportions
- ✅ Clear packaging box
- ✅ Cartoon vinyl figure style
- ✅ Preserved beard and facial structure
- ✅ More stylized/cartoon appearance

---

## Usage Instructions

When you ask me to use:
- **"Attempt 1 config"** or **"Winner config"** → Use the first configuration and prompt
- **"Attempt 3 config"** or **"Classic Funko config"** → Use the second configuration and prompt

## Key Differences

| Aspect | Attempt 1 | Attempt 3 |
|--------|-----------|-----------|
| **Similarity** | 0.7 (more transformation) | 0.8 (preserve more features) |
| **CFG Scale** | 7.0 (balanced) | 9.0 (stronger prompt following) |
| **Seed** | 42 | 999 |
| **Style** | Professional product photo | Classic cartoon Funko |
| **Eyes** | Realistic eyes | Black dot Funko eyes |
| **Best For** | Retail/commercial presentation | Classic collectible style |

## Bedrock Request Template

```python
request_body = {
    "taskType": "IMAGE_VARIATION",
    "imageVariationParams": {
        "text": PROMPT_FROM_ABOVE,
        "images": [image_base64],
        "similarityStrength": SIMILARITY_VALUE
    },
    "imageGenerationConfig": {
        "numberOfImages": 1,
        "quality": "premium",
        "width": 1024,
        "height": 1024,
        "cfgScale": CFG_VALUE,
        "seed": SEED_VALUE
    }
}
```

---

**Last Updated**: 2025-06-23  
**Status**: Production-ready configurations for Funko Pop transformations
