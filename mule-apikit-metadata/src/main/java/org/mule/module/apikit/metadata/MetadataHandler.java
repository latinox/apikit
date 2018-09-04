/*
 * Copyright (c) MuleSoft, Inc.  All rights reserved.  http://www.mulesoft.com
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.txt file.
 */
package org.mule.module.apikit.metadata;

import static com.google.common.base.Strings.isNullOrEmpty;
import static java.util.Optional.empty;
import org.mule.datasense.api.metadataprovider.MetadataFlowResolver;
import org.mule.datasense.api.metadataprovider.MetadataFlowResolverContext;
import org.mule.metadata.api.model.FunctionType;
import org.mule.module.apikit.metadata.interfaces.MetadataSource;
import org.mule.module.apikit.metadata.interfaces.Notifier;
import org.mule.module.apikit.metadata.interfaces.ResourceLoader;
import org.mule.module.apikit.metadata.model.ApikitConfig;
import org.mule.module.apikit.metadata.model.RamlCoordinate;
import org.mule.module.apikit.metadata.raml.RamlHandler;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public class MetadataHandler implements MetadataFlowResolver {

  private static Map<String, String> loadOutboundHeaders(ApikitMetadataModel modelWrapper) {
    final Map<String, String> outboundHeaders = new HashMap<>();

    modelWrapper.getConfigurations().forEach(c -> outboundHeaders.put(c.getName(), c.getOutputHeadersVarName()));

    return outboundHeaders;
  }

  private static Map<String, String> loadHttpStatusVars(ApikitMetadataModel modelWrapper) {
    final Map<String, String> httpStatusVars = new HashMap<>();

    modelWrapper.getConfigurations().forEach(c -> httpStatusVars.put(c.getName(), c.getHttpStatusVarName()));

    return httpStatusVars;
  }

  private Optional<FunctionType> getMetadataForFlow(ApikitMetadataModel apikitMetadataModel, String flowName) {
    Map<String, String> httpStatus = loadHttpStatusVars(apikitMetadataModel); // [{config -> http status var name}]
    Map<String, String> outboundHeaders = loadOutboundHeaders(apikitMetadataModel); // [{config -> output header map name}]

    // Getting the RAML Coordinate for the specified flowName
    final Optional<RamlCoordinate> coordinate = apikitMetadataModel.getRamlCoordinatesForFlow(flowName);

    if (!coordinate.isPresent()) {
      return empty();
    }

    final Optional<ApikitConfig> config = apikitMetadataModel.getConfig(coordinate.get().getConfigName());

    if (!config.isPresent()) {
      return empty();
    }

    final String httpStatusVar = httpStatus.get(config.get().getName());
    final String outboundHeadersVar = outboundHeaders.get(config.get().getName());

    if (isNullOrEmpty(httpStatusVar) || isNullOrEmpty(outboundHeadersVar)) {
      return empty();
    }

    // If there exists metadata for the flow, we get the Api
    return config
        .flatMap(ApikitConfig::getApi)
        .flatMap(api -> api.getActionForFlow(api, coordinate.get(), httpStatusVar, outboundHeadersVar))
        .flatMap(MetadataSource::getMetadata);
  }

  @Override
  public Optional<FunctionType> resolve(String flowName, MetadataFlowResolverContext metadataFlowResolverContext) {
    Notifier notifier = new Notifier() {

      @Override
      public void error(String message) {
        metadataFlowResolverContext.getMetadataResolverNotifier().error(message);
      }

      @Override
      public void warn(String message) {
        metadataFlowResolverContext.getMetadataResolverNotifier().warn(message);
      }

      @Override
      public void info(String message) {
        metadataFlowResolverContext.getMetadataResolverNotifier().info(message);
      }

      @Override
      public void debug(String message) {
        metadataFlowResolverContext.getMetadataResolverNotifier().debug(message);
      }

    };
    RamlHandler ramlHandler = new RamlHandler(new ResourceLoader() {

      // TODO should be changed to retrieve an inputStream and also should handle first resources::
      // or try /api
      @Override
      public File getRamlResource(String relativePath) {
        return metadataFlowResolverContext.getResourceLoader().getResource(relativePath);
      }
    }, notifier);
    ApikitMetadataModel apikitMetadataModel =
        new ApikitMetadataModel(metadataFlowResolverContext.getArtifactDeclaration(), ramlHandler, notifier);
    return getMetadataForFlow(apikitMetadataModel, flowName);
  }

}
