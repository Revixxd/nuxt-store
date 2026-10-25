import { paramsForCategorySwitch, parseListingQuery, toListingQuery } from "#shared/listing"
import type { ListingParams } from "#shared/listing"

export function useListingState() {
  const route = useRoute()

  const params = computed(() => parseListingQuery(route.query))

  /** The query to carry over when switching Category */
  const categoryQuery = computed(() => toListingQuery(paramsForCategorySwitch(params.value)))

  function linkTo(changes: Partial<ListingParams>) {
    return { query: toListingQuery({ ...params.value, ...changes }) }
  }

  function update(changes: Partial<ListingParams>) {
    return navigateTo(linkTo(changes))
  }

  return { params, categoryQuery, linkTo, update }
}
