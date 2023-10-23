import * as React from 'react'

export interface Resource {
  title: string
  href: string
  description: string
}

/**
 * The Resources component is an example of UnoCSS Attributify preset
 * Learn more: https://unocss.dev/presets/attributify
 */
export const Resources: React.FC<{ resources: Resource[] }> = ({ resources }) => {
  return (
    <div
      m="b-32 lg:b-0"
      grid="~ lg:cols-4"
      text="center lg:left"
    >
      {
        resources.map(({ title, href, description }) => (
          <a
            key={href}
            className="group"
            href={href}
            rounded="lg"
            bg="hover:gray-100 dark:hover:neutral-800/50"
            border="~ transparent hover:gray-300 dark:hover:neutral-700"
            p="x-5 y-4"
            transition="colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2
              m="b-3"
              text="2xl"
              font="semibold"
            >
              {title}
              <span
                className="group-hover:-translate-x-1 i-lucide:arrow-up-right"
                inline="block"
                transition="transform"
                motion-reduce="transform-none"
                m="l-1"
              />
            </h2>
            <p
              m="0"
              max-w="[30ch]"
              text="sm"
              className="opacity-50"
            >
              {description}
            </p>
          </a>
        ))
      }
    </div>
  )
}
