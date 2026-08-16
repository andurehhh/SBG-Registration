// frontend/src/lib/appConfig.ts
// Database-backed application configuration (feature flags)

import { supabase } from './supabase'

export async function getRegistrationOpen(): Promise<boolean> {
  const { data, error } = await supabase
    .from('AppConfig')
    .select('value')
    .eq('key', 'registration_open')
    .single()

  if (error || !data) return true // default open if query fails
  return data.value === true
}

export async function setRegistrationOpen(open: boolean): Promise<void> {
  const { error } = await supabase
    .from('AppConfig')
    .update({ value: open })
    .eq('key', 'registration_open')

  if (error) {
    throw new Error(`Failed to update registration status: ${error.message}`)
  }
}
