#!/usr/bin/env bash
# الاستخدام: sonar-report.sh <project-key> [token]
set -euo pipefail

PROJECT_KEY="${1:-documents-list}"
# التوكن عبر الوسيط الثاني أو متغير البيئة SONAR_TOKEN (لا تخزّنه في الملف)
TOKEN="${2:-${SONAR_TOKEN:-}}"
SONAR_URL="http://localhost:9000"
OUTPUT_FILE="${3:-sonar-report.txt}"

if [ -z "$TOKEN" ]; then
  echo "❌ SONAR_TOKEN غير مضبوط. صدّره: export SONAR_TOKEN=<token>" >&2
  exit 1
fi

# ترتيب مستويات الخطورة من الأخطر إلى الأقل
SEVERITIES=("BLOCKER" "CRITICAL" "MAJOR" "MINOR" "INFO")

# حجم الصفحة (أقصى ما يدعمه SonarQube هو 500)
PAGE_SIZE=500

# ---------- 2) التحقق من وجود jq ----------
if ! command -v jq >/dev/null 2>&1; then
  echo "❌ jq غير مثبت. ثبّته عبر: rpm-ostree install jq" >&2
  exit 1
fi

# ---------- 3) تجهيز ملف الإخراج ----------
# إذا وُجد الملف → تفريغه، وإلا → إنشاؤه
if [ -f "$OUTPUT_FILE" ]; then
  : > "$OUTPUT_FILE"     # تفريغ الملف
  echo "♻️  تم تفريغ الملف الموجود: $OUTPUT_FILE"
else
  touch "$OUTPUT_FILE"   # إنشاء الملف
  echo "🆕  تم إنشاء ملف جديد: $OUTPUT_FILE"
fi

# ---------- 4) كتابة ترويسة التقرير ----------
{
  echo "════════════════════════════════════════════════════════"
  echo "  تقرير مشاكل SonarQube"
  echo "════════════════════════════════════════════════════════"
  echo "  المشروع      : $PROJECT_KEY"
  echo "  الخادم       : $SONAR_URL"
  echo "  تاريخ التوليد: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "════════════════════════════════════════════════════════"
  echo ""
} >> "$OUTPUT_FILE"

# ---------- 5) جلب الملخص الإحصائي ----------
{
  echo "📊 الملخص الإحصائي:"
  echo "--------------------------------------------------------"
  curl -s -u "${TOKEN}:" \
    "${SONAR_URL}/api/measures/component?component=${PROJECT_KEY}&metricKeys=bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,security_hotspots" \
    | jq -r '.component.measures[]? | "  \(.metric): \(.value // "غير متوفر")"'
  echo ""
} >> "$OUTPUT_FILE"

# ---------- 6) جلب المشاكل صفحة بصفحة، مستوى تلو الآخر ----------
TOTAL_ADDED=0

for SEV in "${SEVERITIES[@]}"; do
  # أولاً: كم عدد المشاكل في هذا المستوى؟
  TOTAL_SEV=$(curl -s -u "${TOKEN}:" \
    "${SONAR_URL}/api/issues/search?componentKeys=${PROJECT_KEY}&resolved=false&severities=${SEV}&ps=1" \
    | jq '.total // 0')

  # تجاهل المستويات الفارغة
  if [ "$TOTAL_SEV" -eq 0 ]; then
    continue
  fi

  # ترويسة المستوى
  {
    echo "════════════════════════════════════════════════════════"
    echo "🔴 المستوى: $SEV   (عدد المشاكل: $TOTAL_SEV)"
    echo "════════════════════════════════════════════════════════"
  } >> "$OUTPUT_FILE"

  # حساب عدد الصفحات المطلوبة
  TOTAL_PAGES=$(( (TOTAL_SEV + PAGE_SIZE - 1) / PAGE_SIZE ))
  PAGE=1

  while [ "$PAGE" -le "$TOTAL_PAGES" ]; do
    # جلب الصفحة الحالية
    RESPONSE=$(curl -s -u "${TOKEN}:" \
      "${SONAR_URL}/api/issues/search?componentKeys=${PROJECT_KEY}&resolved=false&severities=${SEV}&ps=${PAGE_SIZE}&p=${PAGE}")

    # عدد المشاكل في هذه الصفحة
    COUNT=$(echo "$RESPONSE" | jq '.issues | length')

    # إذا كانت الصفحة فارغة، نتوقف
    if [ "$COUNT" -eq 0 ]; then
      break
    fi

    # إضافة مشاكل الصفحة إلى الملف
    echo "$RESPONSE" | jq -r '
      .issues[] |
      "  • [\(.severity)] \(.type // "CODE_SMELL")" +
      " | \(.component):\(.line // "?")" +
      "\n      \(.message)" +
      "\n      ➜ \(.rule)" +
      "\n"
    ' >> "$OUTPUT_FILE"

    TOTAL_ADDED=$((TOTAL_ADDED + COUNT))
    echo "  ↳ $SEV: صفحة $PAGE/$TOTAL_PAGES — أُضيفت $COUNT مشكلة (تراكمي: $TOTAL_ADDED)"
    PAGE=$((PAGE + 1))
  done

  echo "" >> "$OUTPUT_FILE"
done

# ---------- 7) كتابة الخاتمة ----------
{
  echo "════════════════════════════════════════════════════════"
  echo "  إجمالي المشاكل المُدرجة: $TOTAL_ADDED"
  echo "  التقرير الكامل: ${SONAR_URL}/dashboard?id=${PROJECT_KEY}"
  echo "════════════════════════════════════════════════════════"
} >> "$OUTPUT_FILE"

echo ""
echo "✅ تم إنشاء التقرير: $OUTPUT_FILE"
echo "📄 إجمالي المشاكل المُدرجة: $TOTAL_ADDED"
