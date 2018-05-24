/*
 * Copyright (c) MuleSoft, Inc.  All rights reserved.  http://www.mulesoft.com
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.txt file.
 */
package org.mule.amf.impl;

import java.io.File;
import java.io.FileReader;
import java.net.URL;
import java.util.Arrays;
import org.apache.commons.io.IOUtils;
import org.junit.Assert;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.mule.raml.implv1.ParserV1Utils;
import org.mule.raml.interfaces.model.IRaml;

@RunWith(Parameterized.class)
public class CompatibilityRaml08TestCase extends AbstractCompatibilityTestCase {

  public CompatibilityRaml08TestCase(final String api) {
    super(api);
  }

  @Override
  IRaml buildRaml(final String api) {
    return buildRaml08(api);
  }

  @Parameterized.Parameters(name = "{0}")
  public static Iterable<Object[]> data() {
    return Arrays.asList(new Object[][] {{"raml-08/sanity.raml"}, {"raml-08/leagues/leagues.raml"}});
  }

  private static IRaml buildRaml08(final String resource) {
    final URL url = ParserAmfUtils.class.getResource(resource);
    final File file = new File(url.getFile());

    try {
      final FileReader fileReader = new FileReader(file);
      final String content = IOUtils.toString(fileReader);
      fileReader.close();

      String rootRamlName = file.getName();
      String ramlFolderPath = null;
      if (file.getParentFile() != null) {
        ramlFolderPath = file.getParentFile().getPath();
      }
      return ParserV1Utils.build(content, ramlFolderPath, rootRamlName);
    } catch (Exception e) {
      Assert.fail(e.getMessage());
    }
    return null;
  }

}