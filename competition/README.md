# SnapMagic Competition Judging System

## Quick Start

1. **Configure settings** in `config.json`:
```json
{
  "s3_bucket": "your-bucket-name",
  "s3_prefix": "competition/",
  "top_results": 20,
  "delay_between_requests": 3.0,
  "max_retries": 5,
  "output_file": "ai_judging_results.json"
}
```

2. **Run AI judging**:
```bash
pip install -r requirements_judge.txt
python ai_mass_judge.py
```

## Configuration Options

- **`s3_bucket`** - Your S3 bucket name
- **`s3_prefix`** - Folder path in S3 (e.g., "competition/", "entries/", "round1/")
- **`top_results`** - How many top entries to show (5, 10, 15, 20, etc.)
- **`delay_between_requests`** - Seconds between API calls (3.0 recommended)
- **`max_retries`** - Retry attempts for failed requests (5 recommended)
- **`output_file`** - Where to save results

## Examples

**Judge different folders:**
```json
"s3_prefix": "round1/"     // Judge s3://bucket/round1/
"s3_prefix": "finals/"     // Judge s3://bucket/finals/
"s3_prefix": "entries/"    // Judge s3://bucket/entries/
```

**Different result counts:**
```json
"top_results": 5    // Show top 5
"top_results": 10   // Show top 10
"top_results": 50   // Show top 50
```

## Files

- **`ai_mass_judge.py`** - AI judging system
- **`config.json`** - Configuration settings
- **`scoringcard.md`** - Manual scoring criteria
- **`requirements_judge.txt`** - Dependencies
- **`ai_judging_results.json`** - Latest results
