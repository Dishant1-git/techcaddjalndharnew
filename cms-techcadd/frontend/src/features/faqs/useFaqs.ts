import { faqsApi } from '../../api'
import { createResourceHooks } from '../shared/createResourceHooks'

export const faqHooks = createResourceHooks('faqs', faqsApi)
