import { clientBuilderForStub } from "..";
import { KesselK8SPolicyIsPropagatedToK8SClusterServiceClient } from "./relationships/k8spolicy_ispropagatedto_k8scluster_service";
import { KesselK8sClusterServiceClient } from "./resources/k8s_clusters_service";
import { KesselK8sPolicyServiceClient } from "./resources/k8s_policies_service";
import { KesselNotificationsIntegrationServiceClient } from "./resources/notifications_integrations_service";
import { KesselRhelHostServiceClient } from "./resources/rhel_hosts_service";

/**
 * Client builder for the Kessel K8s Policy Propagation Relationship Service (v1beta1).
 *
 * This service manages relationships between K8s policies and clusters,
 * specifically tracking policy propagation.
 *
 * @example
 * ```typescript
 * const client = KesselK8SPolicyIsPropagatedToK8SClusterClientBuilder.builder()
 *   .withTarget("localhost:9000")
 *   .build();
 * ```
 */
export const KesselK8SPolicyIsPropagatedToK8SClusterClientBuilder =
  clientBuilderForStub(KesselK8SPolicyIsPropagatedToK8SClusterServiceClient);

/**
 * Client builder for the Kessel K8s Cluster Resource Service (v1beta1).
 *
 * This service manages Kubernetes cluster resources in the inventory.
 *
 * @example
 * ```typescript
 * const client = KesselK8sClusterClientBuilder.builder()
 *   .withTarget("localhost:9000")
 *   .build();
 * ```
 */
export const KesselK8sClusterClientBuilder = clientBuilderForStub(
  KesselK8sClusterServiceClient,
);

/**
 * Client builder for the Kessel K8s Policy Resource Service (v1beta1).
 *
 * This service manages Kubernetes policy resources in the inventory.
 *
 * @example
 * ```typescript
 * const client = KesselK8sPolicyClientBuilder.builder()
 *   .withTarget("localhost:9000")
 *   .build();
 * ```
 */
export const KesselK8sPolicyClientBuilder = clientBuilderForStub(
  KesselK8sPolicyServiceClient,
);

/**
 * Client builder for the Kessel Notifications Integration Resource Service (v1beta1).
 *
 * This service manages notification integration resources in the inventory.
 *
 * @example
 * ```typescript
 * const client = KesselNotificationsIntegrationClientBuilder.builder()
 *   .withTarget("localhost:9000")
 *   .build();
 * ```
 */
export const KesselNotificationsIntegrationClientBuilder = clientBuilderForStub(
  KesselNotificationsIntegrationServiceClient,
);

/**
 * Client builder for the Kessel RHEL Host Resource Service (v1beta1).
 *
 * This service manages Red Hat Enterprise Linux host resources in the inventory.
 *
 * @example
 * ```typescript
 * const client = KesselRhelHostClientBuilder.builder()
 *   .withTarget("localhost:9000")
 *   .build();
 * ```
 */
export const KesselRhelHostClientBuilder = clientBuilderForStub(
  KesselRhelHostServiceClient,
);
