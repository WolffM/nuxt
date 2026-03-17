import { describe, expect, it, vi } from 'vitest'
import { applyDefaults } from 'untyped'
import process from 'node:process'

import { normalize } from 'pathe'
import { NuxtConfigSchema } from '../src/index.ts'
import type { NuxtOptions } from '../src/index.ts'

vi.mock('node:fs', () => ({
  existsSync: (id: string) => id.endsWith('app'),
}))

describe('nuxt folder structure', () => {
  it('should resolve directories for v3 setup correctly', async () => {
    const result = await applyDefaults(NuxtConfigSchema, {})
    expect(getDirs(result as unknown as NuxtOptions)).toMatchInlineSnapshot(`
      {
        "dir": {
          "app": "<cwd>/app",
          "modules": "<cwd>/modules",
          "public": "<cwd>/public",
        },
        "rootDir": "<cwd>",
        "serverDir": "<cwd>/server",
        "srcDir": "<cwd>/app",
        "workspaceDir": "<cwd>",
      }
    `)
  })

  it('should resolve directories with a custom `srcDir` and `rootDir`', async () => {
    const result = await applyDefaults(NuxtConfigSchema, { srcDir: 'src/', rootDir: '/test' })
    expect(getDirs(result as unknown as NuxtOptions)).toMatchInlineSnapshot(`
      {
        "dir": {
          "app": "/test/src",
          "modules": "/test/modules",
          "public": "/test/public",
        },
        "rootDir": "/test",
        "serverDir": "/test/server",
        "srcDir": "/test/src",
        "workspaceDir": "/test",
      }
    `)
  })

  it('should resolve directories', async () => {
    const result = await applyDefaults(NuxtConfigSchema, {})
    expect(getDirs(result as unknown as NuxtOptions)).toMatchInlineSnapshot(`
      {
        "dir": {
          "app": "<cwd>/app",
          "modules": "<cwd>/modules",
          "public": "<cwd>/public",
        },
        "rootDir": "<cwd>",
        "serverDir": "<cwd>/server",
        "srcDir": "<cwd>/app",
        "workspaceDir": "<cwd>",
      }
    `)
  })

  it('should resolve directories when opting-in to v4 schema with a custom `srcDir` and `rootDir`', async () => {
    const result = await applyDefaults(NuxtConfigSchema, { srcDir: 'customApp/', rootDir: '/test' })
    expect(getDirs(result as unknown as NuxtOptions)).toMatchInlineSnapshot(`
      {
        "dir": {
          "app": "/test/customApp",
          "modules": "/test/modules",
          "public": "/test/public",
        },
        "rootDir": "/test",
        "serverDir": "/test/server",
        "srcDir": "/test/customApp",
        "workspaceDir": "/test",
      }
    `)
  })

  it('should not override value from user for serverDir', async () => {
    const result = await applyDefaults(NuxtConfigSchema, { serverDir: '/myServer' })
    expect(getDirs(result as unknown as NuxtOptions)).toMatchInlineSnapshot(`
      {
        "dir": {
          "app": "<cwd>/app",
          "modules": "<cwd>/modules",
          "public": "<cwd>/public",
        },
        "rootDir": "<cwd>",
        "serverDir": "/myServer",
        "srcDir": "<cwd>/app",
        "workspaceDir": "<cwd>",
      }
    `)
  })
})

describe('nuxt sourcemap defaults', () => {
  it('should disable sourcemaps for both server and client by default in production', async () => {
    const result = await applyDefaults(NuxtConfigSchema, { dev: false })
    const options = result as unknown as NuxtOptions
    expect(options.sourcemap).toEqual({ server: false, client: false })
  })

  it('should enable sourcemaps for both server and client by default in development', async () => {
    const result = await applyDefaults(NuxtConfigSchema, { dev: true })
    const options = result as unknown as NuxtOptions
    expect(options.sourcemap).toEqual({ server: true, client: true })
  })

  it('should allow user to enable server sourcemaps in production', async () => {
    const result = await applyDefaults(NuxtConfigSchema, { dev: false, sourcemap: { server: true } })
    const options = result as unknown as NuxtOptions
    expect(options.sourcemap).toEqual({ server: true, client: false })
  })

  it('should apply boolean sourcemap to both server and client', async () => {
    const result = await applyDefaults(NuxtConfigSchema, { dev: false, sourcemap: true })
    const options = result as unknown as NuxtOptions
    expect(options.sourcemap).toEqual({ server: true, client: true })
  })
})

function getDirs (options: NuxtOptions) {
  const stripRoot = (dir: string) => {
    return normalize(dir).replace(normalize(process.cwd()), '<cwd>')
  }
  return {
    rootDir: stripRoot(options.rootDir),
    serverDir: stripRoot(options.serverDir),
    srcDir: stripRoot(options.srcDir),
    dir: {
      app: stripRoot(options.dir.app),
      modules: stripRoot(options.dir.modules),
      public: stripRoot(options.dir.public),
    },
    workspaceDir: stripRoot(options.workspaceDir!),
  }
}
