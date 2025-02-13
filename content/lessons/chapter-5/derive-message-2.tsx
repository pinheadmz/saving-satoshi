'use client'

import { useSaveAndProceed, useTranslations } from 'hooks'
import { Button } from 'shared'
import { ChapterIntro } from 'ui'

export const metadata = {
  title: 'chapter_five.derive_message_one.title',
  key: 'CH5DRM2',
}

export default function DeriveMessage1({ lang }) {
  const saveAndProceed = useSaveAndProceed()
  const t = useTranslations(lang)

  return (
    <ChapterIntro className="my-8 text-center">
      <div className="max-w-[900px] px-[15px] py-[10px]">
        <p className="text-xl md:text-[22px]">
          {t('chapter_five.derive_message_two.paragraph_one')}
        </p>
        <p className="mt-8 text-xl md:text-[22px]">
          {t('chapter_five.derive_message_two.paragraph_two')}
        </p>
        <p className="mt-8 text-xl md:text-[22px]">
          {t('chapter_five.derive_message_two.paragraph_three')}
        </p>
      </div>

      <Button onClick={saveAndProceed} classes="mt-10 max-md:w-full">
        {t('shared.next')}
      </Button>
    </ChapterIntro>
  )
}
