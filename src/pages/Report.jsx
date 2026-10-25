import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useT, useI18n } from '../i18n/I18nContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Alert from '../components/ui/Alert'
import { supabase } from '../lib/supabase'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_FILES = 5

const ACCEPTED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
}

function getFileKind(type) {
  for (const [kind, types] of Object.entries(ACCEPTED_TYPES)) {
    if (types.includes(type)) return kind
  }
  return null
}

function makeSafeFileName(name) {
  const cleaned = name
    .normalize('NFKC')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^\.+/, '')
    .slice(0, 120)

  return cleaned || 'evidence-file'
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const categoryOptions = [
  { value: 'catWater', labelKey: 'catWater' },
  { value: 'catRoad', labelKey: 'catRoad' },
  { value: 'catSanitation', labelKey: 'catSanitation' },
  { value: 'catElectricity', labelKey: 'catElectricity' },
  { value: 'catHealth', labelKey: 'catHealth' },
  { value: 'catEducation', labelKey: 'catEducation' },
  { value: 'catOther', labelKey: 'catOther' },
]

const departmentOptions = [
  { value: 'deptMunicipal', labelKey: 'deptMunicipal' },
  { value: 'deptWater', labelKey: 'deptWater' },
  { value: 'deptElectricity', labelKey: 'deptElectricity' },
  { value: 'deptPublicWorks', labelKey: 'deptPublicWorks' },
  { value: 'deptHealth', labelKey: 'deptHealth' },
  { value: 'deptPolice', labelKey: 'deptPolice' },
  { value: 'deptRevenue', labelKey: 'deptRevenue' },
]

const fileIcons = {
  image:
    'M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 14M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z',
  video:
    'M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z',
  audio:
    'M9 19V6l12-3v13M9 19c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm12-3c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z',
  document:
    'M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z',
}

const initialFormData = {
  title: '',
  category: '',
  location: '',
  department: '',
  description: '',
  submissionLanguage: 'en',
}

export default function Report() {
  const t = useT()
  const { lang } = useI18n()

  const [step, setStep] = useState('form')
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [files, setFiles] = useState([])
  const [fileError, setFileError] = useState(null)
  const [confirmation, setConfirmation] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const fileInputRef = useRef(null)
  const submissionLock = useRef(false)

  function updateField(name, value) {
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }

    if (submitError) setSubmitError('')
  }

  function validateForm() {
    const e = {}

    if (!formData.title.trim()) {
      e.title = t.report.errRequired
    } else if (formData.title.trim().length < 5) {
      e.title = t.report.errTitleLength
    }

    if (!formData.category) {
      e.category = t.report.errSelectCategory
    }

    if (!formData.location.trim()) {
      e.location = t.report.errRequired
    }

    if (!formData.department) {
      e.department = t.report.errSelectDepartment
    }

    if (!formData.description.trim()) {
      e.description = t.report.errRequired
    } else if (formData.description.trim().length < 20) {
      e.description = t.report.errDescriptionLength
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleReview() {
    if (!validateForm()) return

    setSubmitError('')
    setStep('review')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit() {
    if (submissionLock.current) return

    submissionLock.current = true
    setIsSubmitting(true)
    setSubmitError('')

    try {
      const {
        data: { session: existingSession },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) throw sessionError

      let session = existingSession

      if (!session) {
        const { data, error } = await supabase.auth.signInAnonymously()

        if (error) throw error
        session = data.session
      }

      if (!session?.user?.id) {
        throw new Error(
          'Could not create a citizen session. Please try again.',
        )
      }

      const { data: complaint, error: insertError } = await supabase
        .from('complaints')
        .insert({
          owner_id: session.user.id,
          title: formData.title.trim(),
          category: formData.category,
          location: formData.location.trim(),
          department: formData.department,
          description: formData.description.trim(),
          submission_language: formData.submissionLanguage,
        })
        .select('id, created_at')
        .single()

      if (insertError) throw insertError

      if (!complaint?.id || !complaint?.created_at) {
        throw new Error(
          'The complaint was submitted, but confirmation details were not returned. Check Supabase before retrying.',
        )
      }

      // Upload files only after the complaint has been created.
      // The path matches the Storage policies:
      // citizen-user-id/complaint-id/filename
      const uploadResults = await Promise.all(
        files.map(async (item, index) => {
          const safeName = makeSafeFileName(item.name)

          const storagePath =
            `${session.user.id}/${complaint.id}/` +
            `${String(index + 1).padStart(2, '0')}_${safeName}`

          const { error } = await supabase.storage
            .from('complaint-evidence')
            .upload(storagePath, item.file, {
              contentType: item.file.type,
              upsert: false,
            })

          if (error) {
            console.error(
              `Evidence upload failed for ${item.name}:`,
              error.message,
            )

            return {
              name: item.name,
              success: false,
            }
          }

          return {
            name: item.name,
            success: true,
          }
        }),
      )

      const uploadedCount = uploadResults.filter(
        (result) => result.success,
      ).length

      const failedCount = uploadResults.length - uploadedCount

      setConfirmation({
        id: complaint.id,
        timestamp: new Date(complaint.created_at).toLocaleString(
          lang === 'hi' ? 'hi-IN' : 'en-IN',
          {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          },
        ),
        uploadedCount,
        failedCount,
        totalFiles: files.length,
      })

      setStep('done')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Complaint submission failed:', error)

      setSubmitError(
        error?.message ||
          'Unable to submit your complaint. Check your connection and try again.',
      )
    } finally {
      submissionLock.current = false
      setIsSubmitting(false)
    }
  }

  function handleFileChange(e) {
    const selected = Array.from(e.target.files || [])
    const newFiles = []
    let error = null

    for (const file of selected) {
      if (files.length + newFiles.length >= MAX_FILES) {
        error = t.report.errFileCount
        break
      }

      const kind = getFileKind(file.type)

      if (!kind) {
        error = t.report.errFileType
        continue
      }

      if (file.size > MAX_FILE_SIZE) {
        error = t.report.errFileSize
        continue
      }

      newFiles.push({
        file,
        kind,
        name: file.name,
        size: file.size,
      })
    }

    if (newFiles.length) {
      setFiles((prev) => [...prev, ...newFiles].slice(0, MAX_FILES))
    }

    setFileError(error)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setFileError(null)
  }

  function resetForm() {
    setFormData(initialFormData)
    setFiles([])
    setErrors({})
    setFileError(null)
    setConfirmation(null)
    setSubmitError('')
    setStep('form')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const catOpts = categoryOptions.map((o) => ({
    value: o.value,
    label: t.report[o.labelKey],
  }))

  const deptOpts = departmentOptions.map((o) => ({
    value: o.value,
    label: t.report[o.labelKey],
  }))

  const steps = [
    { key: 'form', label: t.report.stepForm },
    { key: 'review', label: t.report.stepReview },
    { key: 'done', label: t.report.stepDone },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === step)

  return (
    <div className="container-prose py-8 sm:py-12">
      <div className="flex flex-col gap-3">
        <p className="eyebrow">{t.report.eyebrow}</p>

        <h1 className="font-editorial text-h1 text-ink-900">
          {t.report.title}
        </h1>

        <p className="font-sans text-body-lg text-ink-500 max-w-2xl leading-1.6">
          {t.report.subtitle}
        </p>
      </div>

      <nav aria-label="Progress" className="mt-8">
        <ol className="flex items-center gap-2">
          {steps.map((s, i) => (
            <li key={s.key} className="flex items-center gap-2">
              <span
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-full font-sans text-small font-semibold',
                  i < currentStepIndex
                    ? 'bg-teal-600 text-white'
                    : i === currentStepIndex
                      ? 'bg-teal-600 text-white ring-4 ring-teal-100'
                      : 'bg-sand-200 text-ink-400',
                ].join(' ')}
                aria-current={i === currentStepIndex ? 'step' : undefined}
              >
                {i < currentStepIndex ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>

              <span
                className={[
                  'font-sans text-small font-medium hidden sm:inline',
                  i <= currentStepIndex
                    ? 'text-ink-700'
                    : 'text-ink-300',
                ].join(' ')}
              >
                {s.label}
              </span>

              {i < steps.length - 1 && (
                <span
                  className="h-0.5 w-6 sm:w-10 bg-sand-200 rounded-full"
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {step === 'form' && (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-sand-200 bg-white p-6 sm:p-8 flex flex-col gap-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label={t.report.fieldTitle}
                    id="complaint-title"
                    name="title"
                    required
                    hint={t.report.fieldTitleHint}
                    error={errors.title}
                    value={formData.title}
                    onChange={(e) =>
                      updateField('title', e.target.value)
                    }
                  />
                </div>

                <Select
                  label={t.report.fieldCategory}
                  id="complaint-category"
                  name="category"
                  required
                  placeholder={t.report.fieldCategoryPlaceholder}
                  hint={t.report.fieldCategoryHint}
                  error={errors.category}
                  options={catOpts}
                  value={formData.category}
                  onChange={(e) =>
                    updateField('category', e.target.value)
                  }
                />

                <Input
                  label={t.report.fieldLocation}
                  id="complaint-location"
                  name="location"
                  required
                  hint={t.report.fieldLocationHint}
                  error={errors.location}
                  value={formData.location}
                  onChange={(e) =>
                    updateField('location', e.target.value)
                  }
                />

                <div className="sm:col-span-2">
                  <Select
                    label={t.report.fieldDepartment}
                    id="complaint-department"
                    name="department"
                    required
                    placeholder={t.report.fieldDepartmentPlaceholder}
                    hint={t.report.fieldDepartmentHint}
                    error={errors.department}
                    options={deptOpts}
                    value={formData.department}
                    onChange={(e) =>
                      updateField('department', e.target.value)
                    }
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="complaint-description"
                      className="font-sans text-small font-semibold text-ink-700"
                    >
                      {t.report.fieldDescription}
                      <span
                        className="text-red-600 ml-0.5"
                        aria-hidden="true"
                      >
                        *
                      </span>
                    </label>

                    <textarea
                      id="complaint-description"
                      name="description"
                      rows={5}
                      required
                      aria-describedby="complaint-description-hint"
                      aria-invalid={
                        errors.description ? 'true' : undefined
                      }
                      placeholder={t.report.fieldDescriptionPlaceholder}
                      className={[
                        'font-sans text-body text-ink-900 placeholder:text-ink-300',
                        'bg-white border rounded-md px-3 py-2.5 w-full',
                        'transition-colors duration-fast resize-y',
                        errors.description
                          ? 'border-red-400 focus:border-red-500'
                          : 'border-sand-300 focus:border-teal-500',
                        'focus:outline-none focus:ring-2 focus:ring-teal-500/30',
                      ].join(' ')}
                      value={formData.description}
                      onChange={(e) =>
                        updateField('description', e.target.value)
                      }
                    />

                    <p
                      id="complaint-description-hint"
                      className={`font-sans text-caption ${
                        errors.description
                          ? 'text-red-700'
                          : 'text-ink-400'
                      }`}
                    >
                      {errors.description ||
                        t.report.fieldDescriptionHint}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-small font-semibold text-ink-700">
                  {t.report.fieldEvidence}
                </label>

                <div className="rounded-md border border-dashed border-sand-300 bg-ivory-50 px-4 py-6 flex flex-col items-center gap-3 text-center">
                  <svg
                    className="h-8 w-8 text-ink-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 16a4 4 0 0 1-.88-7.9 5 5 0 0 1 9.65-1.5A4.5 4.5 0 0 1 17 16M9 13l3-3 3 3M12 10v9"
                    />
                  </svg>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-md border border-teal-500 bg-white px-3 py-2 font-sans text-small font-semibold text-teal-700 hover:bg-teal-50 transition-colors duration-fast cursor-pointer"
                  >
                    {t.report.fieldEvidenceButton}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                    className="sr-only"
                    onChange={handleFileChange}
                    aria-label={t.report.fieldEvidence}
                  />

                  <p className="font-sans text-caption text-ink-400 max-w-xs">
                    {t.report.fieldEvidenceHint2}
                  </p>
                </div>

                {fileError && (
                  <p className="font-sans text-caption text-red-700 mt-1">
                    {fileError}
                  </p>
                )}

                {files.length > 0 && (
                  <ul className="mt-2 flex flex-col gap-2">
                    {files.map((f, i) => (
                      <li
                        key={`${f.name}-${i}`}
                        className="flex items-center gap-3 rounded-md border border-sand-200 bg-white px-3 py-2"
                      >
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-ivory-100 text-ink-500">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path d={fileIcons[f.kind]} />
                          </svg>
                        </span>

                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-sans text-small font-medium text-ink-800 truncate">
                            {f.name}
                          </span>
                          <span className="font-sans text-caption text-ink-400">
                            {t.report[
                              `file${f.kind.charAt(0).toUpperCase() + f.kind.slice(1)}`
                            ]}{' '}
                            · {formatBytes(f.size)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="flex-shrink-0 p-1.5 rounded text-ink-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-fast"
                          aria-label={`${t.report.removeFile}: ${f.name}`}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="font-sans text-caption text-ink-400">
                  Up to 5 files, 10 MB each. Selected evidence will be
                  uploaded to private storage when you submit your complaint.
                  Avoid uploading unnecessary personal or sensitive
                  information.
                </p>
              </div>

              <div className="sm:max-w-xs">
                <Select
                  label={t.report.fieldLanguage}
                  id="complaint-language"
                  name="submissionLanguage"
                  hint={t.report.fieldLanguageHint}
                  options={[
                    { value: 'en', label: t.common.english },
                    { value: 'hi', label: t.common.hindi },
                  ]}
                  value={formData.submissionLanguage}
                  onChange={(e) =>
                    updateField('submissionLanguage', e.target.value)
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button size="lg" onClick={handleReview}>
                {t.report.btnReview}
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            </div>
          </div>

          <aside className="lg:col-span-1 flex flex-col gap-4">
            <Alert
              variant="info"
              title={t.report.privacyNotice}
            >
              <p>{t.report.privacyBody}</p>
            </Alert>
          </aside>
        </div>
      )}

      {step === 'review' && (
        <div className="mt-8 max-w-2xl">
          <div className="rounded-lg border border-sand-200 bg-white p-6 sm:p-8">
            <h2 className="font-editorial text-h2 text-ink-900">
              {t.report.reviewHeading}
            </h2>

            <p className="mt-2 font-sans text-body text-ink-500 leading-1.6">
              {t.report.reviewSubtitle}
            </p>

            <dl className="mt-6 flex flex-col divide-y divide-sand-200">
              {[
                [t.report.reviewTitle, formData.title],
                [
                  t.report.reviewCategory,
                  t.report[formData.category],
                ],
                [t.report.reviewLocation, formData.location],
                [
                  t.report.reviewDepartment,
                  t.report[formData.department],
                ],
                [t.report.reviewDescription, formData.description],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-4"
                >
                  <dt className="font-sans text-small font-semibold text-ink-400">
                    {label}
                  </dt>
                  <dd className="font-sans text-body text-ink-800 sm:col-span-2 whitespace-pre-wrap">
                    {value}
                  </dd>
                </div>
              ))}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-4">
                <dt className="font-sans text-small font-semibold text-ink-400">
                  {t.report.reviewEvidence}
                </dt>

                <dd className="font-sans text-body text-ink-800 sm:col-span-2">
                  {files.length === 0
                    ? t.report.reviewNoEvidence
                    : `${files.length} ${
                        files.length === 1
                          ? t.report.reviewFileCount
                          : t.report.reviewFileCountPlural
                      }`}

                  {files.length > 0 && (
                    <>
                      <ul className="mt-2 flex flex-col gap-1">
                        {files.map((f, i) => (
                          <li
                            key={`${f.name}-${i}`}
                            className="font-sans text-small text-ink-500"
                          >
                            {f.name} · {formatBytes(f.size)}
                          </li>
                        ))}
                      </ul>

                      <p className="mt-2 text-caption text-amber-700">
                        These files will be uploaded when you submit the
                        complaint.
                      </p>
                    </>
                  )}
                </dd>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-4">
                <dt className="font-sans text-small font-semibold text-ink-400">
                  {t.report.reviewLanguage}
                </dt>
                <dd className="font-sans text-body text-ink-800 sm:col-span-2">
                  {formData.submissionLanguage === 'en'
                    ? t.common.english
                    : t.common.hindi}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-4">
            <Alert
              variant="info"
              title={t.report.privacyNotice}
            >
              <p>{t.report.privacyBody}</p>
            </Alert>
          </div>

          {submitError && (
            <div
              className="mt-4 rounded-md border border-red-200 bg-red-50 p-4"
              role="alert"
              aria-live="assertive"
            >
              <p className="font-sans text-small font-semibold text-red-800">
                Submission failed
              </p>
              <p className="mt-1 font-sans text-small text-red-700 break-words">
                {submitError}
              </p>
              <p className="mt-2 font-sans text-caption text-red-700">
                If the request timed out, check Supabase Table Editor before
                retrying to avoid a duplicate complaint.
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                setSubmitError('')
                setStep('form')
              }}
              disabled={isSubmitting}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {t.report.btnBackToForm}
            </Button>

            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting…' : t.report.btnSubmit}

              {!isSubmitting && (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 'done' && confirmation && (
        <div className="mt-8 max-w-xl">
          <div className="rounded-lg border border-teal-200 bg-teal-50 p-6 sm:p-8 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-white flex-shrink-0">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>

              <div>
                <h2 className="font-editorial text-h2 text-ink-900">
                  {t.report.confirmHeading}
                </h2>
                <p className="font-sans text-small text-ink-500">
                  {t.report.confirmSubtitle}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-sand-200 border border-sand-200 rounded-md overflow-hidden mt-2">
              <div className="bg-white px-4 py-3 flex flex-col gap-0.5">
                <dt className="font-sans text-caption font-semibold uppercase tracking-wide text-ink-300">
                  {t.report.confirmId}
                </dt>
                <dd className="font-sans text-body font-semibold text-teal-700 break-all">
                  {confirmation.id}
                </dd>
              </div>

              <div className="bg-white px-4 py-3 flex flex-col gap-0.5">
                <dt className="font-sans text-caption font-semibold uppercase tracking-wide text-ink-300">
                  {t.report.confirmTimestamp}
                </dt>
                <dd className="font-sans text-body text-ink-800">
                  {confirmation.timestamp}
                </dd>
              </div>
            </dl>

            <p className="font-sans text-caption text-ink-500">
              Your complaint has been saved. Keep this complaint ID for
              reference.
            </p>

            {confirmation.totalFiles > 0 && (
              <div
                className="rounded-md border border-sand-200 bg-white p-4"
                role="status"
              >
                <p className="font-sans text-small font-semibold text-ink-800">
                  Evidence upload results
                </p>

                <p className="mt-1 font-sans text-small text-ink-600">
                  {confirmation.uploadedCount} of {confirmation.totalFiles}{' '}
                  files uploaded successfully.
                </p>

                {confirmation.failedCount > 0 && (
                  <p className="mt-2 font-sans text-small text-red-700">
                    {confirmation.failedCount} file(s) could not be uploaded.
                    Your complaint is still submitted. Do not submit it again.
                    Keep your original files and contact the project team for
                    help.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 rounded-lg border border-sand-200 bg-white p-6 sm:p-8">
            <h3 className="font-sans text-h4 text-ink-800">
              {t.report.confirmNextSteps}
            </h3>

            <ol className="mt-4 flex flex-col gap-3">
              {[
                t.report.confirmNext1,
                t.report.confirmNext2,
                t.report.confirmNext3,
              ].map((text, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700 font-sans text-small font-semibold">
                    {i + 1}
                  </span>
                  <p className="font-sans text-body text-ink-600 leading-1.6 pt-0.5">
                    {text}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <Button
              variant="secondary"
              size="lg"
              onClick={resetForm}
            >
              {t.report.btnFileAnother}
            </Button>

            <Button as={Link} to="/public-record" size="lg">
              {t.report.btnViewRecord}
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}