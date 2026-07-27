import { jobRepository } from './job-repository'
import type { CreateJobInput } from './types'

type JobHandler = (job: import('@/core/types/common').Job) => Promise<void>

const handlers = new Map<string, JobHandler>()

export const jobQueue = {
  register(type: string, handler: JobHandler): void {
    handlers.set(type, handler)
  },

  async enqueue(input: CreateJobInput): Promise<void> {
    await jobRepository.create(input)
  },

  async processNext(): Promise<void> {
    const pending = await jobRepository.findPending(10)

    for (const job of pending) {
      const handler = handlers.get(job.type)
      if (!handler) continue

      try {
        await jobRepository.updateStatus(job.id, 'processing')
        await handler(job)
        await jobRepository.updateStatus(job.id, 'completed')
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        const shouldRetry = job.retryCount < job.maxRetries

        if (shouldRetry) {
          await jobRepository.incrementRetry(job.id)
          await jobRepository.updateStatus(job.id, 'pending')
        } else {
          await jobRepository.updateStatus(job.id, 'failed', errorMsg)
        }
      }
    }
  },
}
