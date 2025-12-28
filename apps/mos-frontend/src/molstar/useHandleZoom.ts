import { useCallback } from "react"
import { Vec3 } from "molstar/lib/mol-math/linear-algebra"
import { TMolstarPlugin } from "./interface/utils"

export default function useHandleZoom({
  molstarPlugin,
}: {
  molstarPlugin: TMolstarPlugin
}) {

  const zoomIn = useCallback(() => {
    if (!molstarPlugin?.canvas3d) return;

    const camera = molstarPlugin.canvas3d.camera;

    // 计算从 target 到 position 的向量（eye）
    const eye = Vec3();
    Vec3.sub(eye, camera.position, camera.target);

    // 放大：缩小 eye 向量，使相机更接近目标
    // factor < 1 表示缩小距离（放大）
    const zoomSpeed = 0.5;
    const delta = -0.1; // 负值表示向前
    const factor = 1.0 + delta * zoomSpeed;

    if (factor > 0.0) {
      Vec3.scale(eye, eye, factor);
      const newPosition = Vec3();
      Vec3.add(newPosition, camera.target, eye);

      // 使用 setState 更新相机位置
      camera.setState({ position: newPosition });
    }
  }, [molstarPlugin])

  const zoomOut = useCallback(() => {
    if (!molstarPlugin?.canvas3d) return;

    const camera = molstarPlugin.canvas3d.camera;

    // 计算从 target 到 position 的向量（eye）
    const eye = Vec3();
    Vec3.sub(eye, camera.position, camera.target);

    // 缩小：放大 eye 向量，使相机远离目标
    // factor > 1 表示增大距离（缩小）
    const zoomSpeed = 0.5;
    const delta = 0.1; // 正值表示向后
    const factor = 1.0 + delta * zoomSpeed;

    if (factor > 0.0) {
      Vec3.scale(eye, eye, factor);
      const newPosition = Vec3();
      Vec3.add(newPosition, camera.target, eye);

      // 使用 setState 更新相机位置
      camera.setState({ position: newPosition });
    }
  }, [molstarPlugin])

  return {
    zoomIn,
    zoomOut,
  }
}
