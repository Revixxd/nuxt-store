import { paramsForCategorySwitch, parseListingQuery, toListingQuery } from "#shared/listing"
import type { Category } from "#shared/catalog"
import type { ListingParams } from "#shared/listing"

export function useListingState() {
  const route = useRoute()

  const params = computed(() => parseListingQuery(route.query))

  function categoryQuery(category: Category | null) {
    return toListingQuery(paramsForCategorySwitch(params.value, category))
  }

  function linkTo(changes: Partial<ListingParams>) {
    return { query: toListingQuery({ ...params.value, ...changes }) }
  }

  function update(changes: Partial<ListingParams>) {
    return navigateTo(linkTo(changes))
  }

  return { params, categoryQuery, linkTo, update }
}
