import path from 'path'

import sharp from 'sharp'

import { QueryParams, QueryParamsEnum } from './types'

/**
 * Generate the name of the processed image. The name generated follows the
 *  format: <imgName>,<operation>-<value>.<filetype>
 * Example: image1,height-100,width-200.png
 * @param imgName
 * @param queryParams
 * @returns
 */
function generateFileName(
  originalName: string,
  queryParams: QueryParams,
): string {
  const { format, ...operations } = queryParams
  const imgFormat = format ? `.${format}` : path.extname(originalName)

  let newName = originalName.split('.')[0]

  // Concat operations and values in the name
  newName += Object.entries(operations)
    .sort((a: string[], b: string[]) => a[0].localeCompare(b[0]))
    .reduce((acc, curr) => {
      acc += `,${curr[0]}-${curr[1]}`
      return acc
    }, '')

  // Add file format
  newName += imgFormat

  console.log('IMAGE NAME: ', newName)

  return newName
}

function normalizeQuery(params: Record<string, any>): QueryParams {
  // Remove not allowed params
  const normalizedParams = Object.fromEntries(
    Object.entries(params).filter(([attr, _]) => attr in QueryParamsEnum),
  )

  if (Number.isNaN(normalizedParams.width)) {
    throw new Error('Erro normalizing query!')
  }

  if (normalizedParams.width) {
    normalizedParams.width = Number(params.width)
  }

  if (normalizedParams.height) {
    normalizedParams.height = Number(params.height)
  }

  return normalizedParams
}

async function extractOptions(file: Buffer): Promise<QueryParams> {
  const metadata = await sharp(file).metadata()
  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
  }
}

export { generateFileName, normalizeQuery, extractOptions }
