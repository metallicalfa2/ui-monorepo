import React, { useCallback, useEffect, useMemo, useState } from "react"
import { BucketType, FileSystemItem, useDrive } from "../../../Contexts/DriveContext"
import { IFilesBrowserModuleProps } from "./types"
import FilesTableView from "./views/FilesTable.view"
import DragAndDrop from "../../../Contexts/DnDContext"
import { t } from "@lingui/macro"
import { CONTENT_TYPES } from "../../../Utils/Constants"
import { IFilesTableBrowserProps } from "../../Modules/FileBrowsers/types"
import { guessContentType } from "../../../Utils/contentTypeGuesser"
import { useParams, useToaster } from "@chainsafe/common-components"
import { getPathWithFile } from "../../../Utils/pathUtils"
import { ROUTE_LINKS } from "../../FilesRoutes"

const BinFileBrowser: React.FC<IFilesBrowserModuleProps> = ({ controls = false }: IFilesBrowserModuleProps) => {
  const {
    removeCSFObjects,
    moveCSFObject,
    list
  } = useDrive()
  const { addToastMessage } = useToaster()

  const [loadingCurrentPath, setLoadingCurrentPath] = useState(false)
  const [pathContents, setPathContents] = useState<FileSystemItem[]>([])
  const [bucketType] = useState<BucketType>("csf")
  const { currentPath } = useParams<{ currentPath: string }>()

  const refreshContents = useCallback(
    async (
      bucketTypeParam?: BucketType,
      showLoading?: boolean
    ) => {
      try {
        showLoading && setLoadingCurrentPath(true)
        const newContents = await list({
          path: currentPath,
          source: {
            type: bucketTypeParam || bucketType
          }
        })
        showLoading && setLoadingCurrentPath(false)

        if (newContents) {
          // Remove this when the API returns dates
          setPathContents(
            newContents?.map((fcr) => ({
              ...fcr,
              content_type:
                fcr.content_type !== "application/octet-stream"
                  ? fcr.content_type
                  : guessContentType(fcr.name),
              isFolder:
                fcr.content_type === "application/chainsafe-files-directory"
            }))
          )
        }
      } catch (error) {
        showLoading && setLoadingCurrentPath(false)
      }
    },
    [bucketType, list, currentPath]
  )

  useEffect(() => {
    refreshContents()
    // eslint-disable-next-line
  }, [])

  const deleteFile = useCallback(async (cid: string) => {
    const itemToDelete = pathContents.find((i) => i.cid === cid)

    if (!itemToDelete) {
      console.error("No item found to delete")
      return
    }

    try {
      await removeCSFObjects({
        paths: [`${currentPath}${itemToDelete.name}`],
        source: {
          type: bucketType
        }
      })
      await refreshContents()
      const message = `${
        itemToDelete.isFolder ? t`Folder` : t`File`
      } ${t`deleted successfully`}`
      addToastMessage({
        message: message,
        appearance: "success"
      })
      return Promise.resolve()
    } catch (error) {
      const message = `${t`There was an error deleting this`} ${
        itemToDelete.isFolder ? t`folder` : t`file`
      }`
      addToastMessage({
        message: message,
        appearance: "error"
      })
      return Promise.reject()
    }
  }, [addToastMessage, bucketType, currentPath, pathContents, refreshContents, removeCSFObjects])

  const deleteFiles = useCallback(async (cids: string[]) => {
    return Promise.all(
      cids.map((cid: string) =>
        deleteFile(cid)
      ))
  }, [deleteFile])


  const recoverFile = async (cid: string) => {
    const itemToRestore = pathContents.find((i) => i.cid === cid)
    if (!itemToRestore) return
    try {
      await moveCSFObject({
        path: getPathWithFile("/", itemToRestore.name),
        new_path: getPathWithFile("/", itemToRestore.name),
        source: {
          type: "trash"
        },
        destination: {
          type: "csf"
        }
      })
      await refreshContents()

      const message = `${
        itemToRestore.isFolder ? t`Folder` : t`File`
      } ${t`recovered successfully`}`

      addToastMessage({
        message: message,
        appearance: "success"
      })
      return Promise.resolve()
    } catch (error) {
      const message = `${t`There was an error recovering this`} ${
        itemToRestore.isFolder ? t`folder` : t`file`
      }`
      addToastMessage({
        message: message,
        appearance: "error"
      })
      return Promise.reject()
    }
  }

  const handleRecover = async (cid: string) => {
    // TODO set loading
    try {
      await recoverFile(cid)
    } catch {
      //
    }
  }

  const itemOperations: IFilesTableBrowserProps["itemOperations"] = useMemo(() => ({
    [CONTENT_TYPES.File]: ["recover", "delete"],
    [CONTENT_TYPES.Directory]: ["recover", "delete"]
  }), [])

  return (
    <DragAndDrop>
      <FilesTableView
        crumbs={undefined}
        recoverFile={handleRecover}
        deleteFiles={deleteFiles}
        currentPath={currentPath}
        moduleRootPath={ROUTE_LINKS.Bin}
        refreshContents={refreshContents}
        loadingCurrentPath={loadingCurrentPath}
        showUploadsInTable={false}
        sourceFiles={pathContents}
        heading={t`Bin`}
        controls={controls}
        bucketType={bucketType}
        itemOperations={itemOperations}
      />
    </DragAndDrop>
  )
}

export default BinFileBrowser
