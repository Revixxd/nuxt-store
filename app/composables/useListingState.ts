import { parseListingQuery, toListingQuery } from "#shared/listing"
import type { ListingParams } from "#shared/listing"

export function useListingState() {
  const route = useRoute()

  const params = computed(() => parseListingQuery(route.query))

  function linkTo(changes: Partial<ListingParams>) {
    return { query: toListingQuery({ ...params.value, ...changes }) }
  }

  function update(changes: Partial<ListingParams>) {
    return navigateTo(linkTo(changes))
  }

  return { params, linkTo, update }
}
